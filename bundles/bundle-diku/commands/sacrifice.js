'use strict';

const { Broadcast: B, ItemType } = require('ranvier');
const ArgParser = require('../../bundle-diku/lib/ArgParser');
const ItemUtil = require('../../bundle-diku/lib/ItemUtil');

module.exports = {
  usage: 'sacrifice <item>',
  aliases: [ 'sac', 'destroy' ],
  command : (state) => (args, player, arg0) => {
    if (!args.length) {
      return B.sayAt(player, 'Sacrifice what?');
    }

    if (!player.room) {
      return B.sayAt(player, 'You are floating in the nether, there is nothing to get.');
    }

    // 'loot' is an alias for 'get all'
    if (arg0 === 'loot') {
      args = ('all ' + args).trim();
    }

    // get 3.foo from bar -> get 3.foo bar
    let parts = args.split(' ').filter(arg => !arg.match(/from/));

    let source = null, search = null, container = null;
    if (parts.length === 1) {
      search = parts[0];
      source = player.room.items;
    } else {
    //Newest containers should go first, so that if you type get all corpse you get from the 
    // most recent corpse. See issue #247.
      container = ArgParser.parseDot(parts[1], [...player.room.items].reverse());
      if (!container) {
        return B.sayAt(player, "You don't see anything like that here.");
      }

      search = parts[0];
      source = container.inventory;
    }

    if (search === 'all') {
      if (!source || ![...source].length) {
        return B.sayAt(player, "There is nothing here to sacrifice.");
      }

      for (let item of source) {
        // account for Set vs Map source
        if (Array.isArray(item)) {
          item = item[1];
        }

        destroy(item, container, player);
      }

      return;
    }

    const item = ArgParser.parseDot(search, source);
    if (!item) {
      return B.sayAt(player, "You don't see anything like that here.");
    }

    destroy(item, container, player);
  }
};

function destroy(item, container, player) {
  if (item.metadata.owner !== '' || item.metadata.owner !== player.name) {
    return B.sayAt(player, `${ItemUtil.display(item)} is owned by another player.`);
  }

  if (container) {
    container.removeItem(item);
  } else {
    player.room.removeItem(item);
  }

  const currencyKey = 'currencies.gold';
  if (!player.getMeta('currencies')) {
    player.setMeta('currencies', { "gold": 0});
  }

  player.setMeta(currencyKey, (player.getMeta(currencyKey) || 0) + item.value);

  B.sayAt(player, `<green>You sacrifice ${ItemUtil.display(item)} for <b><white>${sellable.value} ${friendlyCurrencyName(sellable.currency)}</white></b>.</green>`);
}
