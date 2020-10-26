'use strict';

const { Broadcast: B } = require('ranvier');

module.exports = {
  usage: 'clanwithdraw <amount>',
  command : (state) => (args, player) => {
    args = args.trim();

    if (!args.length) {
      return B.sayAt(player, 'How much gold are you wanting to withdraw?');
    }

    let gold = player.getMeta('currencies.gold');
    let guildBalance = player.getMeta('guildBalance');

    if( !guildBalance ) {
      player.setMeta( 'guildBalance', 0);
      guildBalance = 0;
    }

    if( guildBalance < args ) {
      return B.sayAt(player, `You don't have that much gold in the guild bank!`);
    }

    player.setMeta('currencies.gold', gold + args );
    player.setMeta('guildBalanace', guildBalance - args );
    return B.sayAt(player, `You have withdrawn ${args} from the guild bank.`);


  }
};
