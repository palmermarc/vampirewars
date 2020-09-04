'use strict';

const { Logger, AreaAudience, Broadcast: B } = require('ranvier');

module.exports = {
  command: state => (args, player) => {
    if( !player.room){
      return B.sayAt(player, `You're not even in a room... WTF?!?!?`);
    }
    let playerCount = 0;
    const { area } = player.room;

    B.sayAt(player, `Players near you:`);

    Logger.log(area);

    area.players.forEach(otherPlayer => {
      if (otherPlayer === player) {
        //return;
      }


      B.sayAt(player, `${otherPlayer.name} - ${otherPlayer.room.name}`);
    });

    if(playerCount == 0 ) {
      return B.sayAt(player, `There is no one near you.`)
    }

  }
};