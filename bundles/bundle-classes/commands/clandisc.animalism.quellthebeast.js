'use strict';

const { Broadcast: B, Npc } = require('ranvier');
const { Random } = require('rando-js');

const Combat = require('../../bundle-diku-combat/lib/Combat');
const CombatErrors = require('../../bundle-diku-combat/lib/CombatErrors');

module.exports = {
  usage: 'quellthebeast <target>',
  aliases: [ 'quell', 'quellthebeast' ],
  command : (state) => (args, player) => {

    if( player.getMeta('class' ) !== 'vampire' ) {
      return B.sayAt(player, `You have to be a vampire to use this ability.`);
    }

    if( player.getMeta( 'clandiscs.animalism' ) < 3 ) {
      return B.sayAt(player, `Only players with Rank 3 of Animalism can use this ability.`);
    }

    args = args.trim();

    if (!args.length) {
      return B.sayAt(player, 'Quell whom?');
    }

    if (!player.isInCombat()) {
      return B.sayAt(player, "You are not currently fighting!");
    }

    let target = null;
    try {
      target = Combat.findCombatant(player, args);
    } catch (e) {
      if (
        e instanceof CombatErrors.CombatSelfError ||
        e instanceof CombatErrors.CombatNonPvpError ||
        e instanceof CombatErrors.CombatInvalidTargetError ||
        e instanceof CombatErrors.CombatPacifistError
      ) {
        return B.sayAt(player, e.message);
      }

      Logger.error(e.message);
    }

    if (!target) {
      return B.sayAt(player, "Drastically lowers the beast of target. If the target is a NPC, has a chance to make the mobs cower in fear. Only usable in combat.");
    }

    if( target.isNpc ) {
      if(Random.probability(60)) {
        B.sayAt(player, `${target.name} cowers in fear as you quell their beast.`);
        return state.CommandManager.get('flee').execute('', target);
      } else {
        B.sayAt(player, `You have failed to quell ${target.name}.`);
      }
    } else {

      if( target.getMeta('class') !== 'vampire') {
        return B.sayAt(player, `You can only do that to vampires!`);
      }

      let beast = targetItem.getMeta('beast');
      if (!beast) {
        beast = 50;
      }

      target.setMeta('beast', Math.floor(beast/2));

      B.sayAt(player, `You quell ${target.name} and lower their beast.`);
      B.sayAt(target, `${player.name} quells your and lowers your beast!`);
      return B.sayAtExcept(player.room, `${player.name} quells ${target.name} and lowers their beast!`, [player, target]);
    }
  }
};
