'use strict';

const { Broadcast: B, Logger } = require('ranvier');
const { Random } = require('rando-js');

module.exports = {
  usage: 'recall',
  command : (state) => (args, player) => {
    let room = player.room;
    let noRecall = room.getMeta('norecall') || false;
    let home = player.getMeta('home') || 'midgaard:r3001';
    home = state.RoomManager.getRoom(home);

    B.sayAtExcept(room, `${player.name}'s body flickers with green energy.`, player );
    B.sayAt(player, `Your body flickers with green energy.`);

    if(home == room) {
      return B.sayAt(player, `You are already in your home, genius.`);
    }

    if(noRecall) {
      return B.sayAt(player, `You are unable to recall.`);
    }

    if (player.isInCombat() && Random.probability(85)) {
      return B.sayAt(player, `You failed to recall.`);
    }

    player.moveTo(home, () => {
      B.sayAtExcept(room, `${player.name} disappears.`, player);
      B.sayAtExcept(home, `${player.name} appears in the room`, player);
      state.CommandManager.get('look').execute('', player);
    });
  }
};
