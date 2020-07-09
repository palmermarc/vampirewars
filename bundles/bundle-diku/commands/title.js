'use strict';

const { Broadcast: B } = require('ranvier');

module.exports = {
  usage: 'title <message>',
  command: (state) => (args, player) => {
    args = args.trim();

    player.setMeta('title', args);
    return B.sayAt(player, `Your title has been set.`);

  }
};