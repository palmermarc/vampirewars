'use strict';

const { Broadcast: B } = require('ranvier');
const ArgParser = require('../lib/ArgParser');
const dot = ArgParser.parseDot;
const ItemUtil = require('../lib/ItemUtil');

module.exports = {
  usage: 'gift <item> <target>',
  command: state => (args, player) => {
    if (!args || !args.length) {
      return B.sayAt(player, 'Gift what to whom?');
    }

    let [ targetItem, to, targetRecip ] = args.split(' ');
    // give foo to bar
    if (to !== 'to' || !targetRecip) {
      targetRecip = to;
    }

    if (!targetRecip) {
      return B.sayAt(player, 'Who do you want to gift it to?');
    }

    targetItem = dot(targetItem, player.inventory);

    if (!targetItem) {
      return B.sayAt(player, 'You don\'t have that item.');
    }

    if(targetItem.metadata.owner !== player) {
      return B.sayAt(player, 'You can\'t gift an item that you don\'t own.');
    }

    // prioritize players before npcs
    let target = dot(targetRecip, player.room.players);

    if (!target) {
      target = dot(targetRecip, player.room.npcs);
      if (target) {
        const accepts = target.getBehavior('accepts');
        if (!accepts || !accepts.includes(targetItem.entityReference)) {
          return B.sayAt(player, 'They don\'t want that.');
        }
      } 
    }

    if (!target) {
      return B.sayAt(player, 'They aren\'t here.');
    }

    if (target === player) {
      return B.sayAt(player, `<green>You move ${ItemUtil.display(targetItem)} from one hand to the other. That was productive.</green>`);
    }

    if (target.isInventoryFull()) {
      return B.sayAt(player, 'They can\'t carry any more.');
    }

    player.removeItem(targetItem);
    target.addItem(targetItem);

    B.sayAt(player, `<green>${ItemUtil.display(targetItem)} is the new owner of <white>${target.name}</white>.</green>`);
    if (!target.isNpc) {
      B.sayAt(target, `<green>${player.name} gifts you ${ItemUtil.display(targetItem)}.</green>`);
    }
  }
};
