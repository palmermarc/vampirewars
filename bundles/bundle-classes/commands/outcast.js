'use strict';

const { Broadcast: B } = require('ranvier');
const ArgParser = require('../../bundle-diku/lib/ArgParser');

module.exports = {
  usage: 'clandeposit <amount>',
  command : (state) => (args, player) => {

    if( player.getMeta('class') !== 'vampire' ) {
      return B.sayAt(player, 'Huh?');
    }

    if( player.getMeta('generation') >= 3 ) {
      return B.sayAt(player, `You're trying to do something above your pay grade. Try getting gen 3 before making big-boy decisions.`);
    }

    args = args.trim();

    if (!args.length) {
      return B.sayAt(player, 'Who are you wanting to outcast?');
    }


  }
};
