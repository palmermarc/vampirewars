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
  name: 'Energy Drain',
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

    B.sayAt(player, '<bold>Your Energy Drain strikes ${target.name} for ${damage} damage.</bold>');
    B.sayAtExcept(player.room, `<bold>${player.name}'s Energy Drain strikes ${target.name}!</bold>`, [player, target]);
    if (!target.isNpc) {
      B.sayAt(target, `<bold>${player.name}'s Energy Drain strikes you for ${damage} damage.</bold>`);
    }

    const damage = new Damage('health', spellDamage, player, this, {
      type: 'physical',
    });

    damage.commit(target);

    // Define the stat gains for the caster
    const healHealth = new Heal('health', spellDamage/3, player, this);
    const healMana = new Heal('mana', spellDamage/3, player, this);
    const healMove = new Heal('move', spellDamage/3, player, this);

    // Apply the stat gains defined above
    healHealth.commit(target);
    healMana.commit(target);
    healMove.commit(target);
  },

  info: (player) => {
    return `Call upon the light to heal your target's wounds for ${healPercent}% of your Intellect.`;
  }
};