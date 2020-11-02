'use strict';

const { Broadcast: B } = require('ranvier');

module.exports = {
  usage: 'subsumethespirit',
  aliases: [ 'subsume', 'subsumethespirit' ],
  command : (state) => (args, player) => {

    if( player.getMeta('class' ) !== 'vampire' ) {
      return B.sayAt(player, `You have to be a vampire to use this ability.`);
    }

    if( player.getMeta( 'clandiscs.animalism' ) < 4 ) {
      return B.sayAt(player, `Only players with Rank 4 of Animalism can use this ability.`);
    }

    let activated = player.getMeta('upkeep.subsumeTheSpirit');
    if( !activated ) {
      player.setMeta('upkeep.subsumeTheSpirit', 5);
      B.sayAt(player, `You contort and growl, as your body changes into the form of a Wolf.`);
      return B.sayAtExcept(player.room, `${player.name}'s body contorts and they let out a loud howl.`, player);
    } else {
      player.setMeta('upkeep.subsumeTheSpirit', 0);
      B.sayAt(player, `You scream out as your body reverts back to a normal form.`);
      return B.sayAtExcept(player.room, `${player.name} screams in agony as their body reverts back to a human form.`, player);
    }

    // TODO: Add the bonuses into the Combat library
  }
};
