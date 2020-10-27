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

    const result = ArgParser.parseDot(arg, player.equipment, true);
    if (!result) {
      return B.sayAt(player, "You aren't wearing anything like that.");
    }

    const [slot, item] = result;
    B.sayAt(player, `<green>You un-equip: </green>${ItemUtil.display(item)}<green>.</green>`);
    player.unequip(slot);
  }
};
