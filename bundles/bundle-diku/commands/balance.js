'use strict';

const { Broadcast: B } = require('ranvier');

module.exports = {
  usage: 'balance',
  aliases: [ 'clanbalance' ],
  command : (state) => (args, player) => {
    let room = player.room;

    if( room.getMeta('bank') ) {
      return B.sayAt('Maybe you should be in a bank before checking your balance?');
    }

    let balance = player.getMeta('balance');

    if( !balance ) {
      player.setMeta( 'balance', 0);
      balance = 0;
    }


    return B.sayAt(player, `You have ${balance} gold in the guild bank.`);
  }
};
