'use strict';

const LootTable = require('../../lib/LootTable');
const { Player, Item, Logger } = require('ranvier');
const { Random } = require('rando-js');

module.exports = {
  listeners: {
    killed: state => async function (config, killer) {
      const { room, name, area, keywords } = this;

      const lootTable = new LootTable(state, config);
      const currencies = lootTable.currencies();
      const roll = await lootTable.roll();
      const items = roll.map(
        item => state.ItemFactory.create(state.AreaManager.getAreaByReference(item), item)
      );

      let slotAtttributes = {
        head: ['strength', 'dexterity', 'constitution', 'health', 'armor', 'dodge'],
        neck: ['strength', 'dexterity', 'intellect', 'wisdom', 'constitution', 'health', 'move', 'save_vs_spell'],
        body: ['strength', 'constitution', 'dexterity', 'health', 'armor', 'dodge', 'intellect'],
        legs: ['dexterity', 'move', 'dodge', 'armor'],
        hands: ['strength', 'hit_chance', 'attack_power', 'parry'],
        arms: ['strength', 'constitution', 'hit_chance', 'attack_power'],
        about: ['strength', 'dexterity', 'intellect', 'wisdom', 'constitution', 'health', 'move'],
        waist: ['strength', 'dexterity', 'intellect', 'wisdom', 'constitution', 'health', 'move'],
        wrist: ['strength', 'hit_chance', 'attack_power', 'parry'],
        wield: ['hit_chance', 'attack_power', 'parry'],
        face: ['intellect', 'hit_chance', 'attack_power'],
        finger: ['strength', 'dexterity', 'intellect', 'wisdom', 'constitution', 'health', 'move', 'save_vs_spell']
      };

      const corpse = new Item(area, {
        id: 'corpse',
        name: `Corpse of ${name}`,
        roomDesc: `Corpse of ${name}`,
        description: `The rotting corpse of ${name}`,
        keywords: keywords.concat(['corpse']),
        type: 'CONTAINER',
        metadata: {
          noPickup: true
        },
        value: 5,
        maxItems: items.length,
        behaviors: {
          decay: {
            duration: 180
          }
        },
      });

      corpse.hydrate(state);

      Logger.log(`Generated corpse: ${corpse.uuid}`);

      items.forEach(item => {
        let itemSlot = item.getMeta('slot') || 'none';
        let itemStats = item.getMeta('stats') || [];

        if( itemSlot !== 'none' && !itemStats.length) {

          Logger.log(`Trying to set custom stats to ${item.name}`);

          let qualityChance = Random.inRange(1,100000);

          let quality = 'common';
          let maxStats = 2;
          let stats = {};


          if( qualityChance === 100000) {
            quality = 'artifact';
            maxStats = 6;
          } else if (qualityChance >= 99000) {
            quality = 'legendary';
            maxStats = 5;
          } else if (qualityChance >= 90000) {
            quality = 'epic';
            maxStats = 4;
          } else if (qualityChance >= 75000) {
            quality = 'rare';
            maxStats = 3;
          } else if (qualityChance >= 50000) {
            quality= 'uncommon';
            maxStats = 2;
          } else if (qualityChance >= 1) {
            quality = 'common';
            maxStats = 1;
          } else {
            quality = 'poor';
            maxStats = 0;
          }

          Logger.log(`Attempting to find the attributes for slot: ${itemSlot}`);
          Logger.log(slotAtttributes);

          let possibleStats = slotAtttributes[itemSlot];

          item.setMeta('stats', {});

          let i = 0;
          do {
            let attribute = Random.fromArray(possibleStats);

            const attributeIndex = possibleStats.indexOf(attribute);
            if( attributeIndex > -1) {
              possibleStats.splice(attributeIndex, 1);
            }

            let statAmount = 1;

            item.setMeta(`stats.${attribute}`, statAmount);
            //stats.attribute = statAmount;
            i++;
          } while ( i < maxStats && possibleStats.length);


          // Set the item quality
          item.setMeta('quality', quality);
          //item.setMeta('stats', stats);

          // TODO: Grab the available stats from the array above and load random stats to the item
        }

        item.hydrate(state);
        corpse.addItem(item);
      });

      room.addItem(corpse);
      state.ItemManager.add(corpse);

      if (killer && killer instanceof Player) {
        if (currencies) {
          currencies.forEach(currency => {
            // distribute currency among group members in the same room
            const recipients = (killer.party ? [...killer.party] : [killer]).filter(recipient => {
              return recipient.room === killer.room;
            });

            let remaining = currency.amount;
            for (const recipient of recipients) {
              // Split currently evenly amount recipients.  The way the math works out the leader
              // of the party will get any remainder if the currency isn't divisible evenly
              const amount = Math.floor(remaining / recipients.length) + (remaining % recipients.length);
              remaining -= amount;

              recipient.emit('currency', currency.name, amount);
              state.CommandManager.get('look').execute(corpse.uuid, recipient);
            }
          });
        }
      }
    }
  }
};
