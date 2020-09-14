'use strict';

const { Random } = require('rando-js');
const { Broadcast: B, SkillType } = require('ranvier');
const Combat = require('../../bundle-combat/lib/Combat');

// config placed here just for easy copy/paste of this skill later on
const cooldown = 10;
const cost = 50;
const duration = 5 * 1000;
const tickInterval = 3;
const damagePercent = 1;

const totalDamage = player => {
  return Combat.calculateWeaponDamage(player) * (damagePercent / 100);
};


/**
 * DoT (Damage over time) skill
 */
module.exports = {
  name: 'Punch',
  type: SkillType.SKILL,
  requiresTarget: true,
  initiatesCombat: true,
  resource: {
    attribute: 'move',
    cost,
  },
  cooldown,

  run: state => function (args, player, target) {
    const room = player.room;

    if( player == target ) {
      return B.sayAt(player, 'You cannot punch yourself!');
    }

    if(room.getMeta('safe') === TRUE ) {
      return B.sayAt(player, 'You are in a safe room.');
    }

    const targetHp = target.getAttribute('health');

    // If the target isn't at max health
    if( target.getAttribute('health').max() > target.getAttribute('health') * 0.95 ) {
      return B.sayAt(player, 'They are hurt and suspicious.' );
    }


    B.sayAt(player, `You draw your fist back and aim a punch at ${target.name}`);
    B.sayAt(target, `${player.name} draws their fist back and aims a punch at you.`);
    B.sayAtExcept(room, `"{player.name} draws $s fist back and aims a punch at ${target.name}.`, [player,target]);

    let hit = Random.probability(critChance);
    if( !hit ) {
      B.sayAt(player, 'You')
    }

    const effect = state.EffectFactory.create(
      'skill.punch',
      {
        duration,
        description: this.info(player),
        tickInterval,
      },
      {
        totalDamage: totalDamage(player),
      }
    );

    effect.skill = this;
    effect.attacker = player;

    effect.on('effectDeactivated', _ => {
      B.sayAt(player, `<red><b>${target.name}</b> clambers back to their feet.</red>`);
    });

    B.sayAt(player, `<red>With a vicious attack you open a deep wound in <bold>${target.name}</bold>!</red>`);
    B.sayAtExcept(player.room, `<red>${player.name} viciously rends ${target.name}.</red>`, [target, player]);
    B.sayAt(target, `<red>${player.name} viciously rends you!</red>`);
    target.addEffect(effect);
  },

  info: (player, target) => {
    return `You punch ${target.name} in the face and they go down like a ton of bricks!`;
  }
};
