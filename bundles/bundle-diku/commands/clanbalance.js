'use strict';

const { Broadcast: B } = require('ranvier');

module.exports = {
  usage: 'clanbalance',
  command : (state) => (args, player) => {
    let balance = player.getMeta('balance');

    if( !balance ) {
      player.setMeta( 'balance', 0);
      balance = 0;
    }

    return B.sayAt(player, `You have ${balance} gold in the guild bank.`);
  }
};
