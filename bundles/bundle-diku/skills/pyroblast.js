'use strict';

const { Broadcast, Damage, SkillType, Logger } = require('ranvier');
const { Random } = require('rando-js');

const damagePercent = 100;
const manaCost = 80;

function getDamage(player) {
  let variance = Random.inRange(75, 125)/100;
  return ((500 + ((player.level - 1) * 10) + player.getAttribute('intellect') *2)) * variance;
}

/**
 * Basic mage spell
 */
module.exports = {
  name: 'Pyroblast',
  type: SkillType.SPELL,
  requiresTarget: true,
  initiatesCombat: true,
  resource: {
    attribute: 'mana',
    cost: manaCost,
  },
  cooldown: 300,

  run: state => function (args, player, target) {
    const damage = new Damage('health', getDamage(player), player, this, {
      type: 'fire',
    });

    Broadcast.sayAt(player, '<bold>With a wave of your hand, you unleash a <red>fire</red></bold><yellow>b<bold>all</bold></yellow> <bold>at your target!</bold>');
    Broadcast.sayAtExcept(player.room, `<bold>With a wave of their hand, ${player.name} unleashes a <red>fire</red></bold><yellow>b<bold>all</bold></yellow> <bold>at ${target.name}!</bold>`, [player, target]);
    if (!target.isNpc) {
      Broadcast.sayAt(target, `<bold>With a wave of their hand, ${player.name} unleashes a <red>fire</red></bold><yellow>b<bold>all</bold></yellow> <bold>at you!</bold>`);
    }
    damage.commit(target);
  },

  info: (player) => {
    return `Hurl a magical fireball at your target dealing ${damagePercent}% of your Intellect as Fire damage.`;
  }
};
