'use strict';

const { Broadcast: B } = require('ranvier');
const ArgParser = require('../lib/ArgParser');

module.exports = {
  usage: 'deposit <amount>',
  aliases: [ 'clandeposit' ],
  command : (state) => (args, player) => {

    let room = player.room;

    if( room.getMeta('bank') ) {
      return B.sayAt('Maybe you should be in a bank before giving your money away?');
    }

    args = args.trim();

    if (!args.length) {
      return B.sayAt(player, 'How much gold are you wanting to deposit?');
    }

    let gold = player.getMeta('currencies.gold');
    let balance = player.getMeta('balance');

    if( !balance ) {
      player.setMeta( 'balance', 0);
      balance = 0;
    }

    if( gold < args ) {
      return B.sayAt(player, `You don't have that much gold!`);
    }

    player.setMeta('currencies.gold', gold - args );
    player.setMeta('guildBalanace', balance + args );
    return B.sayAt(player, `You have deposited ${args} into the guild bank.`);
  }
};
