'use strict';

const { Config, Player, Logger } = require('ranvier');
const PlayerClass = require('../../bundle-classes/lib/PlayerClass');

/**
 * Finish player creation. Add the character to the account then add the player
 * to the game world
 */
module.exports = {
  event: state => {
    const startingRoomRef = Config.get('startingRoom');
    if (!startingRoomRef) {
      Logger.error('No startingRoom defined in ranvier.json');
    }

    return async (socket, args) => {
      let player = new Player({
        name: args.name,
        account: args.account,
      });

      // TIP:DefaultAttributes: This is where you can change the default attributes for players
      const defaultAttributes = {
        health: 500,
        mana: 500,
        move: 500,
        strength: 25,
        intellect: 25,
        constitution: 25,
        dexterity: 25,
        wisdom: 25,
        hit_chance: 90,
        attack_power: 5,
        critical_strike: 5,
        dodge: 5,
        parry: 5,
        save_vs_spell: 5
      };

      for (const attr in defaultAttributes) {
        player.addAttribute(state.AttributeFactory.create(attr, defaultAttributes[attr]));
      }

      args.account.addCharacter(args.name);
      args.account.save();

      player.setMeta('class', 'human');

      player.setMeta('stances', { bull: 0, crane: 0, mongoose: 0, viper: 0, cobra: 0, falcon: 0, grizzlie: 0, lion: 0, panther: 0, swallow: 0 });
      player.setMeta('spells ', { blue: 0, green: 0, purple: 0, red: 0, yellow: 0 });
      player.setMeta('weapons', { hit: 0, slice: 0, stab: 0, slash: 0, whip: 0, claw: 0, blast: 0, pound: 0, crush: 0, bite: 0, grep: 0, pierce: 0, suck: 0 });
      player.setMeta('tiers', { spells: 0, stances: 0, weapons: 0 });

      player.setMeta('currentStance', 'none');

      let startingGear = [
        'newbie:ring',
        'newbie:ring',
        'newbie:lightningneck',
        'newbie:chestplate',
        'newbie:helmet',
        'newbie:leggings',
        'newbie:boots',
        'newbie:gloves',
        'newbie:armguards',
        'newbie:cloak',
        'newbie:girth',
        'newbie:flamingbracer',
        'newbie:icybracer',
        'newbie:bag',
        'newbie:sword',
        'newbie:sword',
        'newbie:mask'
      ];

      startingGear.forEach(itemName => {
        let item = state.ItemFactory.create(state.AreaManager.getAreaByReference(itemName), itemName);
        player.addItem(item);
      });

      const room = state.RoomManager.getRoom(startingRoomRef);
      player.room = room;
      await state.PlayerManager.save(player);

      // reload from manager so events are set
      player = await state.PlayerManager.loadPlayer(state, player.account, player.name);
      player.socket = socket;

      socket.emit('done', socket, { player });

      state.CommandManager.get('wear').execute('all', player);
    };
  }
};