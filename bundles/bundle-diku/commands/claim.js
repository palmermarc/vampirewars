'use strict';

const { Broadcast } = require('ranvier');
const ArgParser = require('../../bundle-diku/lib/ArgParser');
const ItemUtil = require('../../bundle-diku/lib/ItemUtil');

module.exports = {
  usage: 'claim <item>',
  command : (state) => (args, player) => {
    args = args.trim();

    if (!args.length) {
      return Broadcast.sayAt(player, 'Claim what?');
    }

    const item = ArgParser.parseDot(args, player.inventory);

    if (!item) {
      return Broadcast.sayAt(player, "You aren't carrying anything like that.");
    }

    const claimCost = 10000;
    const currency = "gold";
    const currencyKey = 'currencies.' + currency;
    const playerCurrency = player.getMeta(currencyKey);
    if (!playerCurrency || playerCurrency < 10000) {
      return Broadcast.sayAt(player, `You can't afford that, it costs ${claimCost} ${friendlyCurrencyName(currency)} to claim an item.`);
    }

    player.setMeta(currencyKey, playerCurrency - claimCost);
    item.setMeta('owner', player);
    Broadcast.sayAt(player, `<green>You are now the owner of </green>${ItemUtil.display(item)}<green>.</green>`);
  }
};
