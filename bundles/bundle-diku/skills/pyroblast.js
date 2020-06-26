'use strict';

const { Broadcast, Damage, SkillType } = require('ranvier');

const damagePercent = 500;
const manaCost = 1500;

function getDamage(player) {
  return player.getAttribute('intellect') * (damagePercent / 100);
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
  cooldown: 60,

  run: state => function (args, player, target) {
    const damage = new Damage('health', getDamage(player), player, this, {
      type: 'physical',
    });

    /**
     * TODO: Currently only mages can cast this ability. Tremere may get this in the future, though.
     */

    Broadcast.sayAt(player, '<bold>A large ball of fire explodes from your hands as you unleash a <yellow><bold>PYROBLAST</bold></yellow> <bold>at your target!</bold>');
    Broadcast.sayAtExcept(player.room, `<bold>A large ball of fire appears to explode from ${player.name}'s hand and unleashes a <yellow><bold>PYROBLAST</bold></yellow> at ${target.name}!</bold>`, [player, target]);
    if (!target.isNpc) {
      Broadcast.sayAt(target, `<bold>A large ball of fire explodes from ${player.name}'s hands as they unleash a <yellow><bold>PYROBLAST</bold></yellow> <bold>at you!</bold>`);
    }
    damage.commit(target);
  },

  info: (player) => {
    return `Hurl a massive ball of fire dealing ${damagePercent}% of your Intellect as Fire damage to your target.`;
  }
};
