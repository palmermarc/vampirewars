'use strict';

const Ranvier = require('ranvier');
const { Broadcast: B, Logger } = Ranvier;
const { EquipSlotTakenError } = Ranvier.EquipErrors;
const ItemUtil = require('../lib/ItemUtil');
const ArgParser = require('../lib/ArgParser');

function actuallyEquipItem(player, item) {
  try {

    if( !item.metadata.slot) {
      return '';
    }

    if( item.metadata.slot === 'finger' ) {

      Logger.log(`${item.name} is worn on the finger.`);

      // The player isn't wearing it's first ring, so put it on the left finger
      if( !player.equipment.has('finger_l' ) ) {
        player.equip(item, 'finger_l' );
        return `<green>You equip:</green> ${ItemUtil.display(item)}<green>.</green>`;
      }

      if( !player.equipment.has('finger_r' ) ) {
        player.equip(item, 'finger_r' );
        return `<green>You equip:</green> ${ItemUtil.display(item)}<green>.</green>`;
      }

      player.unequip('finger_l');
      player.equip(item, 'finger_l');
      return  `<green>You equip:</green> ${ItemUtil.display(item)}<green>.</green>`;
    }

    // Check to
    if( item.metadata.slot === 'wrist' ) {
      Logger.log(`${item.name} is worn on the wrist.`);
      // The player isn't wearing it's first ring, so put it on the left finger
      if( !player.equipment.has('left_wrist' ) ) {
        player.equip(item, 'left_wrist' );
        return `<green>You equip:</green> ${ItemUtil.display(item)}<green>.</green>`;
      }

      if( !player.equipment.has('right_wrist' ) ) {
        player.equip(item, 'right_wrist' );
        return `<green>You equip:</green> ${ItemUtil.display(item)}<green>.</green>`;
      }

      player.unequip('left_wrist');
      player.equip(item, 'left_wrist');
      return `<green>You equip:</green> ${ItemUtil.display(item)}<green>.</green>`;
    }

    // Check if the weapon is specifically a 2h weapon or not
    if( item.metadata.slot === '2hand' ) {
      Logger.log(`${item.name} is worn on the hands.`);
      if( player.equipment.has('left_hand' ) ) {
        //player.unequip('left_hand' );
      }

      if( player.equipment.has('right_hand' ) ) {
        //player.unequip('right_hand' );
      }

      player.equip(item, 'wield' );
      return `<green>You equip:</green> ${ItemUtil.display(item)}<green>.</green>`;
    }

    // Check if the weapon is specifically a 2h weapon or not
    if( item.metadata.slot === 'wield' ) {
      Logger.log(`${item.name} is worn on one hand.`);
      // The player isn't wearing it's first ring, so put it on the left finger
      if( !player.equipment.has('left_hand' ) ) {
        player.equip(item, 'left_hand' );
        return `<green>You equip:</green> ${ItemUtil.display(item)}<green>.</green>`;
      }

      if( !player.equipment.has('right_hand' ) ) {
        player.equip(item, 'right_hand' );
        return `<green>You equip:</green> ${ItemUtil.display(item)}<green>.</green>`;
      }

      // They have weapons in both hands - so just pull it from their left hand and put it there
      player.unequip('left_hand');
      player.equip(item, 'left_hand');
      return `<green>You equip:</green> ${ItemUtil.display(item)}<green>.</green>`;
    }

    /**
     * It wasn't a ring or a weapon, so everything else only has one item slot.
     * Remove whatever they are wearing and then let them wear the new item
     */
    Logger.log(`${item.name} is worn on a different slot.`);
    if( player.equipment.has(item.metadata.slot)) {
      Logger.log(`There is already something in the ${item.metadata.slot} slot.`);
      player.unequip(item.metadata.slot);
    }

    Logger.log(`${item.name} has been equipped.`);

    player.equip(item, item.metadata.slot);
    return `<green>You equip:</green> ${ItemUtil.display(item)}<green>.</green>`;

  } catch (err) {
    if (err instanceof EquipSlotTakenError) {
      const conflict = player.equipment.get(item.metadata.slot);
      return `You will have to remove ${ItemUtil.display(conflict)} first.`;
    }

    return Logger.error(err);
  }
}

module.exports = {
  aliases: [ 'wield' ],
  usage: 'wear <item>',
  command : (state) => (arg, player) => {
    arg = arg.trim();

    if (!arg.length) {
      return B.sayAt(player, 'Wear what?');
    }

    if( arg === "all" ) {
      player.inventory.forEach(item => {
        let itemSlot = item.metadata.slot || 'none';
        if (itemSlot !== 'none') {
          let response = actuallyEquipItem(player, item);
          B.sayAt(player, `${response}`);
        }
      });
      return;
    }

    const item = ArgParser.parseDot(arg, player.inventory);

    if (!item) {
      return B.sayAt(player, "You aren't carrying anything like that.");
    }

    if (!item.metadata.slot) {
      return B.sayAt(player, `You can't wear ${ItemUtil.display(item)}.`);
    }

    if (item.level > player.level) {
      return B.sayAt(player, "You can't use that yet.");
    }

    let response = actuallyEquipItem(player, item);
    if(response.length) B.sayAt(player, `${response}`);
  }
};
