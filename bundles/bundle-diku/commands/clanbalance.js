'use strict';

const { Broadcast: B } = require('ranvier');

module.exports = {
  usage: 'clanbalance',
  command : (state) => (args, player) => {
    let guildBalance = player.getMeta('guildBalance');

    if( !guildBalance ) {
      player.setMeta( 'guildBalance', 0);
      guildBalance = 0;
    }

    return B.sayAt(player, `You have ${guildBalance} gold in the guild bank.`);
  }
};
