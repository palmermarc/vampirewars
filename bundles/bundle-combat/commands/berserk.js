'use strict';

const { Broadcast: B, Logger } = require('ranvier');
const Combat = require('../lib/Combat');
const CombatErrors = require('../lib/CombatErrors');

module.exports = {
  command : (state) => (args, player) => {
    B.sayAt(player, `You go berserk!`);
    B.sayAtExcept(player.room, `${player.name} goes berserk!`, [player]);

    const room = player.room;

    let targets = 0;

    room.npcs.forEach(npc => {
      if(targets < 10){
        player.initiateCombat(npc);
      }

      targets++;
    });
  }
};