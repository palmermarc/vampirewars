'use strict';

const { Broadcast: B } = require('ranvier');
const ArgParser = require('../../bundle-diku/lib/ArgParser');
const ItemUtil = require('../../bundle-diku/lib/ItemUtil');

module.exports = {
  aliases: [ 'unwield', 'unequip' ],
  usage: 'remove <item>',
  command : state => (arg, player) => {
    if (!arg.length) {
      return B.sayAt(player, 'Remove what?');
    }

    if( arg === 'all' ){
      for (const [slot, item] of player.equipment) {
        player.unequip(slot);

        B.sayAt(player, `You stop using ${ItemUtil.display(item)}.`);
        B.sayAtExcept(player.room, `${player.name} stops using ${ItemUtil.display(item)}.`, [player]);
      }
      return;
    }

    const result = ArgParser.parseDot(arg, player.equipment, true);
    if (!result) {
      return B.sayAt(player, "You aren't wearing anything like that.");
    }

    const [slot, item] = result;
    B.sayAt(player, `You stop using ${ItemUtil.display(item)}.`);
    B.sayAtExcept(player.room, `${player.name} stops using ${ItemUtil.display(item)}.`, [player]);
    player.unequip(slot);
  }
};
