'use strict';

const { Broadcast: B } = require('ranvier');

module.exports = {
  usage: 'spy [direction]',
  command: state => (direction, player) => {
    if (!player.isInCombat()) {
      return B.sayAt(player, "You jump at the sight of your own shadow.");
    }

    B.sayAt(player, `[Short Range]`);
    B.sayAt(player, `[Medium Range]`);
    B.sayAt(player, `[Long Range]`);
  }
};
