'use strict';

const { Broadcast: B, Logger } = require('ranvier');
const { Random } = require('rando-js');

module.exports = {
  usage: 'drawingoutthebeast <target>',
  aliases: [ 'drawingoutthebeast', 'drawing' ],
  command : (state) => (args, player) => {

    if( player.getMeta('class' ) !== 'vampire' ) {
      return B.sayAt(player, `You have to be a vampire to use this ability.`);
    }

    if( player.getMeta( 'clandiscs.animalism' ) < 5 ) {
      return B.sayAt(player, `Only players with Rank 5 of Animalism can use this ability.`);
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
      return B.sayAt(player, "They aren't here");
    }

    if( target.isNpc ) {
      return B.sayAt(player, `Drawing Out the Beast can only be used on players.`);
    }

    if( target.getMeta('class') !== 'vampire' ) {
      return B.sayAt(player, `${target.name} is not a vampire.`);
    }

    let playerBeast = player.getMeta('beast');
    if( !playerBeast || playerBeast < 10 ) {
      return B.sayAt(player, `Your beast is under 10 and you are unable to transfer it.`);
    }

    if( Random.probability(60)) {
      B.sayAt(player, `You draw out your beast and give it to ${target.name}.`);
      B.sayAt(target, `{player.name} has drawn out their beast and passed it to you.`);

      let targetBeast = target.getMeta('beast');
      if(!targetBeast) {
        targetBeast = 0;
      }

      let amountToGive = Random.roll(1, playerBeast);
      amountToGive = targetBeast+amountToGive;

      if( amountToGive > 100 )
        amountToGive = 100;

      let amountToTake = playerBeast+amountToGive;

      if( amountToGive <= 0 )
        amountToTake = 0;

      player.setMeta('beast', amountToTake);
      target.setMeta('beast', amountToGive);

    } else {
      B.sayAt(player, `You failed to draw ${target.name}'s beast.`);
      return B.sayAt(`${target.name} has tried to draw our their beast, but failed.`);
    }

  }
};
