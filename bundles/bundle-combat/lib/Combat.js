'use strict';

const { Random } = require('rando-js');
const { Broadcast: B, Damage, Logger } = require('ranvier');
const Parser = require('../../bundle-diku/lib/ArgParser');
const CombatErrors = require('./CombatErrors');

/**
 * This class is an example implementation of a Diku-style real time combat system. Combatants
 * attack and then have some amount of lag applied to them based on their weapon speed and repeat.
 */
class Combat {
  /**
   * Handle a single combat round for a given attacker
   * @param {GameState} state
   * @param {Character} attacker
   * @return {boolean}  true if combat actions were performed this round
   */
  static updateRound(state, attacker) {
    if (attacker.combatData.killed) {
      // entity was removed from the game but update event was still in flight, ignore it
      return false;
    }

    if (!attacker.isInCombat()) {
      if (!attacker.isNpc) {
        attacker.removePrompt('combat');
      }
      return false;
    }

    let lastRoundStarted = attacker.combatData.roundStarted;
    attacker.combatData.roundStarted = Date.now();

    // cancel if the attacker's combat lag hasn't expired yet
    if (attacker.combatData.lag > 0) {
      const elapsed = Date.now() - lastRoundStarted;
      attacker.combatData.lag -= elapsed;
      return false;
    }

    // currently just grabs the first combatant from their list but could easily be modified to
    // implement a threat table and grab the attacker with the highest threat
    let target = null;
    try {
      target = Combat.chooseCombatant(attacker);
    } catch (e) {
      attacker.removeFromCombat();
      attacker.combatData = {};
      throw e;
    }

    // no targets left, remove attacker from combat
    if (!target) {
      attacker.removeFromCombat();
      // reset combat data to remove any lag
      attacker.combatData = {};
      return false;
    }

    if (target.combatData.killed) {
      // entity was removed from the game but update event was still in flight, ignore it
      return false;
    }

    let attackerAutoStance = attacker.getMeta('autostance');
    if( attacker.getMeta('currentStance') === 'none' && attacker.getMeta('autostance') !== 'none' ) {
      state.CommandManager.get('stance').execute(attackerAutoStance, attacker);
    }

    let targetAutoStance = target.getMeta('autostance');
    if( target.getMeta('currentStance') === 'none' && target.getMeta('autostance') !== 'none' ) {
      state.CommandManager.get('stance').execute(targetAutoStance, target);
    }

    Combat.makeAttack(attacker, target);
    return true;
  }

  /**
   * Find a target for a given attacker
   * @param {Character} attacker
   * @return {Character|null}
   */
  static chooseCombatant(attacker) {
    if (!attacker.combatants.size) {
      return null;
    }

    for (const target of attacker.combatants) {
      if (!target.hasAttribute('health')) {
        throw new CombatErrors.CombatInvalidTargetError();
      }
      if (target.getAttribute('health') > 0) {
        return target;
      }
    }

    return null;
  }

  /**
   * Actually apply some damage from an attacker to a target
   * @param {Character} attacker
   * @param {Character} target
   */
  static makeAttack(attacker, target) {
    let amount = this.calculateWeaponDamage(attacker);
    let critical = false;

    if (attacker.hasAttribute('critical')) {
      const critChance = Math.max(attacker.getMaxAttribute('critical') || 0, 0);
      critical = Random.probability(critChance);
      if (critical) {
        amount = Math.ceil(amount * 1.5);
      }
    }

    if(!attacker.isNpc && attacker.getMeta('currentStance') !== 'none') {
      Combat.improveStance(attacker);
      Combat.improveWeapon(attacker);

      Logger.log(`${attacker.name} is swinging for ${amount} damage before stances.`);

      let stanceDamage = Combat.calculateStanceDamage(attacker, attacker, amount)
      Logger.log(`${attacker.name} gained ${amount} damage because of stances.`);

      //amount = Math.ceil(amount + stanceDamage);
      Logger.log(`${attacker.name} is swinging for ${amount} damage.`);
    }

    const weapon = attacker.equipment.get('wield');
    const damage = new Damage('health', amount, attacker, weapon || attacker, { critical });
    damage.commit(target);

    // currently lag is really simple, the character's weapon speed = lag
    attacker.combatData.lag = this.getWeaponSpeed(attacker) * 1000;
  }

  /**
   * Any cleanup that has to be done if the character is killed
   * @param {Character} deadEntity
   * @param {?Character} killer Optionally the character that killed the dead entity
   */
  static handleDeath(state, deadEntity, killer) {
    if (deadEntity.combatData.killed) {
      return;
    }

    deadEntity.combatData.killed = true;
    deadEntity.removeFromCombat();

    Logger.log(`${killer ? killer.name : 'Something'} killed ${deadEntity.name}.`);

    if (killer) {
      deadEntity.combatData.killedBy = killer;
      killer.emit('deathblow', deadEntity);
    }
    deadEntity.emit('killed', killer);

    if (deadEntity.isNpc) {
      state.MobManager.removeMob(deadEntity);
    }
  }

  static startRegeneration(state, entity) {
    if (entity.hasEffectType('regen')) {
      return;
    }

    let regenEffect = state.EffectFactory.create('regen', { hidden: true }, { magnitude: 15 });
    if (entity.addEffect(regenEffect)) {
      regenEffect.activate();
    }
  }

  /**
   * @param {string} args
   * @param {Player} player
   * @return {Entity|null} Found entity... or not.
   */
  static findCombatant(attacker, search) {
    if (!search.length) {
      return null;
    }

    let possibleTargets = [...attacker.room.npcs];
    if (attacker.getMeta('pvp')) {
      possibleTargets = [...possibleTargets, ...attacker.room.players];
    }

    const target = Parser.parseDot(search, possibleTargets);

    if (!target) {
      return null;
    }

    if (target === attacker) {
      throw new CombatErrors.CombatSelfError("You smack yourself in the face. Ouch!");
    }

    if (!target.hasBehavior('combat')) {
      throw new CombatErrors.CombatPacifistError(`${target.name} is a pacifist and will not fight you.`, target);
    }

    if (!target.hasAttribute('health')) {
      throw new CombatErrors.CombatInvalidTargetError("You can't attack that target");
    }

    if (!target.isNpc && !target.getMeta('pvp')) {
      throw new CombatErrors.CombatNonPvpError(`${target.name} has not opted into PvP.`, target);
    }

    return target;
  }

  /**
   * Generate an amount of weapon damage
   * @param {Character} attacker
   * @param {boolean} average Whether to find the average or a random between min/max
   * @return {number}
   */
  static calculateWeaponDamage(attacker, average = false) {
    let weaponDamage = this.getWeaponDamage(attacker);
    let amount = 0;
    if (average) {
      amount = (weaponDamage.min + weaponDamage.max) / 2;
    } else {
      amount = Random.inRange(weaponDamage.min, weaponDamage.max);
    }

    return this.normalizeWeaponDamage(attacker, amount);
  }

  /**
   * Get the damage of the weapon the character is wielding
   * @param {Character} attacker
   * @return {{max: number, min: number}}
   */
  static getWeaponDamage(attacker) {
    const weapon = attacker.equipment.get('wield');
    let min = 0, max = 0;
    if (weapon) {
      min = weapon.metadata.minDamage;
      max = weapon.metadata.maxDamage;
    }

    return {
      max,
      min
    };
  }

  /**
   * Get the speed of the currently equipped weapon
   * @param {Character} attacker
   * @return {number}
   */
  static getWeaponSpeed(attacker) {
    let speed = 2.0;
    const weapon = attacker.equipment.get('wield');
    if (!attacker.isNpc && weapon) {
      speed = weapon.metadata.speed;
    }

    return speed;
  }

  /**
   * Get a damage amount adjusted by attack power/weapon speed
   * @param {Character} attacker
   * @param {number} amount
   * @return {number}
   */
  static normalizeWeaponDamage(attacker, amount) {
    let speed = this.getWeaponSpeed(attacker);
    amount += attacker.hasAttribute('strength') ? attacker.getAttribute('strength') : attacker.level;
    return Math.round(amount / 3.5 * speed);
  }

  static calculateStanceDamage(attacker, victim, amount) {
    const attackerStance = attacker.getMeta('currentStance');
    const victimStance = victim.getMeta('currentStance');

    if(attackerStance !== 'none') {
      // Apply bonus amplification of Bull stance
      if( attackerStance === 'bull' ) {
        const stanceLevel = attacker.getMeta('stances.bull');
        amount += (100 +(stanceLevel/100))/100;
      }

      // Apply bonus amplification of Bull stance
      if( attackerStance === 'lion' ) {
        const stanceLevel = attacker.getMeta('stances.lion');
        amount *= (100 +(stanceLevel/50))/100;
      }

      if( attackerStance === 'grizzlie' ) {
        const stanceLevel = attacker.getMeta('stances.grizzlie');
        amount *= (100 +(stanceLevel/80))/100;
      }

      if( attackerStance === 'mongoose' ) {
        const stanceLevel = attacker.getMeta('stances.mongoose');
        amount *= (100 +(stanceLevel/166.66))/100;
      }

      if( attackerStance === 'falcon' ) {
        const stanceLevel = attacker.getMeta('stances.falcon');
        amount *= (100 +(stanceLevel/66.66))/100;
      }

      if( attackerStance === 'cobra' ) {
        const stanceLevel = attacker.getMeta('stances.cobra');
        amount *= (100 +(stanceLevel/133.33))/100;
      }
    }

    if(victimStance !== 'none') {
      if(victimStance === 'mongoose') {
        amount *= (100 - (victim.getMeta('stances.mongoose') / 66.66)) / 100;
      }

      if(victimStance === 'falcon') {
        amount *= (100 - (victim.getMeta('stances.falcon') / 40)) / 100;
      }

      if(victimStance === 'swallow') {
        amount *= (100 - (victim.getMeta('stances.swallow') / 20)) / 100;
      }

      if(victimStance === 'panther') {
        amount *= (100 - (victim.getMeta('stances.panther')/ 40)) / 100;
      }

      // A victim in Lion stance takes more damage... Light 'em up!
      if(victimStance === 'lion') {
        amount *= 1.1;
      }
    }

    return amount;
  }

  static improveStance(attacker) {
    let stance = attacker.getMeta('currentStance');

    // Don't worry about anything if they are unstanced
    if(stance == 'none'){
      return;
    }

    // Max is 200 + 5 points per tier
    let stanceMax = 200;
    let tiers = attacker.getMeta('tiers.stances');

    if(!tiers) {
      stanceMax += (tiers*5);
    }

    let stanceKey = 'stances.'+stance;
    let currentStanceLevel = attacker.getMeta(stanceKey);

    // If they are capped at a stance level, then return and don't worry about the math
    if(currentStanceLevel == stanceMax) {
      return;
    }

    const diceroll1 = Random.roll(1, stanceMax);
    const diceroll2 = Random.roll(1, stanceMax);

    if (diceroll1 >= currentStanceLevel && diceroll2 >= currentStanceLevel) {
      Logger.log(`${attacker.name} gained a point in the ${stance} stance.`);
      let newLevel = currentStanceLevel + 1;
      switch(stance) {
        case 'bull':
          attacker.setMeta('stances.bull', newLevel);
          break;
        case 'crane':
          attacker.setMeta('stances.crane', newLevel);
          break;
        case 'mongoose':
          attacker.setMeta('stances.mongoose', newLevel);
          break;
        case 'viper':
          attacker.setMeta('stances.viper', newLevel);
          break;
        case 'cobra':
          attacker.setMeta('stances.cobra', newLevel);
          break;
        case 'falcon':
          attacker.setMeta('stances.falcon', newLevel);
          break;
        case 'grizzlie':
          attacker.setMeta('stances.grizzlie', newLevel);
          break;
        case 'lion':
          attacker.setMeta('stances.lion', newLevel);
          break;
        case 'panther':
          attacker.setMeta('stances.panther', newLevel);
          break;
        case 'swallow':
          attacker.setMeta('stances.swallow', newLevel);
          break;
      }

      if (newLevel == 1){
        B.sayAt(attacker, `You are now an apprentice of the ${stance} stance.`);
      }
      else if (newLevel == 26) {
        B.sayAt(attacker, `You are now a trainee of of the ${stance} stance.`);
      }
      else if (newLevel == 51) {
        B.sayAt(attacker, `You are now a student of the ${stance} stance.`);
      }
      else if (newLevel == 76) {
        B.sayAt(attacker, `You are now fairly experienced in the ${stance} stance.`);
      }
      else if (newLevel == 101) {
        B.sayAt(attacker, `You are now "well trained in the ${stance} stance.`);
      }
      else if (newLevel == 126) {
        B.sayAt(attacker, `You are now highly skilled in the ${stance} stance.`);
      }
      else if (newLevel == 151) {
        B.sayAt(attacker, `You are now an expert of the ${stance} stance.`);
      }
      else if (newLevel == 176) {
        B.sayAt(attacker, `You are now a master of the ${stance} stance.`);
      }
      else if (newLevel == 186) {
        B.sayAt(attacker, `You are now more masterful of the ${stance} stance.`);
      }
      else if (newLevel == 196) {
        B.sayAt(attacker, `You are now even more masterful of the ${stance} stance.`);
      }
      else if (newLevel == 199) {
        B.sayAt(attacker, `You are now on the verge of grand mastery of the ${stance} stance.`);
      }
      else if (newLevel == 200) {
        B.sayAt(attacker, `You are now a grand master of the ${stance} stance.`);
      }
      else if (newLevel > 200) {
        B.sayAt(attacker, `You are now even better with the ${stance} stance.`);
      }
    }

    return;
  }

  static improveWeapon(attacker) {
    return;
  }
}

module.exports = Combat;
