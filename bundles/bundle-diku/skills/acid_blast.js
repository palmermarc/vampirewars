'use strict';

const { Broadcast: B, Heal, SkillType } = require('ranvier');

const healPercent = 300;
const manaCost = 100;

function getDamage(player) {
  return 20 + (player.getAttribute('spell_power') * 5) + (player.level * 45);
}

/**
 * Basic spell that deals damage and heals the caster
 */
module.exports = {
  name: 'Acid Blast',
  type: SkillType.SPELL,
  requiresTarget: true,
  initiatesCombat: true,
  targetSelf: false,
  resource: {
    attribute: 'mana',
    cost: manaCost,
  },
  cooldown: 10,

  run: state => function (args, player, target) {

    // Get the damage done, then give it a 10% variance
    const spellDamage = getDamage(player) * (Math.random() * (110 - 90) + 90)/100;

    Broadcast.sayAt(player, '<bold>Your Acid Blast strikes ${target.name} for ${damage} damage.</bold>');
    Broadcast.sayAtExcept(player.room, `<bold>${player.name}'s Acid Blast strikes ${target.name}!</bold>`, [player, target]);
    if (!target.isNpc) {
      Broadcast.sayAt(target, `<bold>${player.name}'s Acid Blast strikes you for ${damage} damage.</bold>`);
    }

    const damage = new Damage('health', spellDamage, player, this, {
      type: 'physical',
    });

    damage.commit(target);
  },

  info: (player) => {
    return `Call upon the light to heal your target's wounds for ${healPercent}% of your Intellect.`;
  }
};