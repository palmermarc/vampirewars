'use strict';

const { Broadcast: B, Damage, SkillType, Logger } = require('ranvier');
const { Random } = require('rando-js');

const Combat = require('../../bundle-combat/lib/Combat');
const CombatErrors = require('../../bundle-combat/lib/CombatErrors');

const damagePercent = 100;
const manaCost = 80;

function getDamage(player) {
  let variance = Random.inRange(75, 125)/100;
  Logger.log(`The spell is modified by ${variance}`);
  return ((50 + ((player.level - 1) * 2) + player.getAttribute('intellect'))) * variance ;
}

/**
 * Basic mage spell
 */
module.exports = {
  name: 'Fire Breath',
  type: SkillType.SPELL,
  requiresTarget: false,
  initiatesCombat: false,
  resource: {
    attribute: 'mana',
    cost: manaCost,
  },
  cooldown: 10,

  run: state => function (args, player, target) {
    const room = player.room;
    B.sayAt(player, `Your eyes glow bright purple for a moment.`);
    B.sayAtExcept(room, `${player.name}'s eyes glow bright purple for a moment.`, [player]);

    if (!room.npcs.size) {
      return B.sayAt(player, `This would have been a hell of a lot more impressive if anything was here for you to attack.`);
    }

    room.npcs.forEach(npc => {
      player.initiateCombat(npc);
      const damage = new Damage('health', getDamage(player), player, this, {
        type: 'magical',
      });

      damage.commit(npc);
    });

  },

  info: (player) => {
    return `Breath toxic gas at your enemies. Be warned, this attacks any NPC in the room.`;
  }
};
