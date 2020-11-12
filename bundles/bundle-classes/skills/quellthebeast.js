'use strict';

const { Broadcast: B, SkillType } = require('ranvier');

module.exports = {
  name: 'Berserk',
  type: SkillType.SKILL,
  requiresTarget: false,
  resource: {
    attribute: 'move',
    cost: 100,
  },
  cooldown: 10,
  run: state => function (args, player) {

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
  },
  info: (player) => {
    return `Make a strong attack against up to 10 targets in the room.`;
  }
};