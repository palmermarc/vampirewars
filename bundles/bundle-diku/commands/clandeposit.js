'use strict';

const { Broadcast: B } = require('ranvier');
const ArgParser = require('../../bundle-diku/lib/ArgParser');

module.exports = {
  usage: 'clandeposit <amount>',
  command : (state) => (args, player) => {
    args = args.trim();

    if (!args.length) {
      return B.sayAt(player, 'How much gold are you wanting to deposit?');
    }

    let gold = player.getMeta('currencies.gold');
    let guildBalance = player.getMeta('guildBalance');

    if( !guildBalance ) {
      player.setMeta( 'guildBalance', 0);
      guildBalance = 0;
    }

    if( gold < args ) {
      return B.sayAt(player, `You don't have that much gold!`);
    }

    player.setMeta('currencies.gold', gold - args );
    player.setMeta('guildBalanace', guildBalance + args );
    return B.sayAt(player, `You have deposited ${args} into the guild bank.`);


  }
};
