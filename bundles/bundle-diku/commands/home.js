'use strict';

const { Broadcast: B, Logger } = require('ranvier');

module.exports = {
  usage: 'home here',
  command : (state) => (args, player) => {
    let room = player.room;
    let currentHome = player.getMeta('home') || 'midgaard:r3001';
    currentHome = state.RoomManager.getRoom(currentHome);

    if(!args.length) {
      B.sayAt(player, `If you wish this to be your room, you must type 'home here'`);
      return B.sayAt(player, `Your current home is ${currentHome.title}`);
    }

    if(args !== 'here') {
      return B.sayAt(player, `If you wish this to be your room, you must type 'home here'`);
    }

    if(room === currentHome) {
      return B.sayAt(player, `But this is already your home!`);
    }

    if( room.getMeta('norecall') || room.getMeta('nohome') || room.getMeta('safe')) {
      return B.sayAt(player, `You are unable to make this room your home.`);
    }

    player.setMeta('home', `${room.entityReference}`)

    B.sayAt(player, `This room is now your home.`);
  }
};
