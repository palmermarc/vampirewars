'use strict';

module.exports = [
  {
    name: 'strength',
    base: 5,
    metadata: {
      label: 'Str'
    }
  },
  {
    name: 'dexterity',
    base: 5,
    metadata: {
      label: 'Dex'
    }
  },
  {
    name: 'intellect',
    base: 5,
    metadata: {
      label: 'Int'
    }
  },
  {
    name: 'wisdom',
    base: 5,
    metadata: {
      label: 'Wis'
    }
  },
  {
    name: 'constitution',
    base: 5,
    metadata: {
      label: 'Con'
    },
  },
  {
    name: 'mana',
    base: 500,
    metadata: {
      label: 'Mana',
      levelMultiplier: 10
    },
    fn: function (character, mana) {
      // Using the example formula from before:
      return Math.floor(
        // Give them 10 per level
        mana + (character.level - 1) * this.metadata.levelMultiplier
      );
    }
  },
  {
    name: 'health',
    base: 5,
    metadata: {
      label: 'Health',
      levelMultiplier: 10,
    },
    fn: function (character, health) {
      // Using the example formula from before:
      return Math.floor(
        health + (character.level - 1) * this.metadata.levelMultiplier
      );
    }
  },
  {
    name: 'move',
    base: 5,
    metadata: {
      label: 'Movement',
      levelMultiplier: 10
    },
    fn: function (character, move) {
      // Using the example formula from before:
      return Math.floor(
        move + (character.level - 1) * this.metadata.levelMultiplier
      );
    }
  },
  {
    name: 'armor',
    base: 5,
    metadata: {
      label: 'Armor',
      levelMultiplier: 5
    }
  },
  {
    name: 'hit_chance',
    base: 90,
    metadata: {
      label: 'Hit Chance'
    }
  },
  {
    name: 'critical_strike',
    base: 5,
    metadata: {
      label: 'Critical Strike'
    }
  },
  {
    name: 'attack_power',
    base: 5,
    metadata: {
      label: 'Attack Power',
      classModifiers: {
        human: 1,
        mage: 0.5,
        vampire: 2,
        werewolf: 3,
        _default: 1,
      },
    },
    formula: {
      requires: ['strength'],
      fn: function (character, attack_power, strength) {
        const characterClass = character.getMeta('class') || '_default';
        const modifier = this.metadata.classModifiers[characterClass];
        return attack_power + (strength * modifier);
      },
    },
  },
  {
    name: 'save_vs_spell',
    base: 5,
    metadata: {
      label: 'Save vs. Spell'
    }
  },
  {
    name: 'gold_boost',
    base: 5,
    metadata: {
      label: 'Gold Boost'
    }
  },
  {
    name: 'exp_boost',
    base: 5,
    metadata: {
      label: 'EXP Boost'
    }
  },
  {
    name: 'qp_boost',
    base: 5,
    metadata: {
      label: 'QP Boost'
    }
  },
  {
    name: 'parry',
    base: 5,
    metadata: {
      label: 'Parry'
    }
  },
  {
    name: 'block',
    base: 5,
    metadata: {
      label: 'Block Chance'
    }
  },
  {
    name: 'dodge',
    base: 5,
    metadata: {
      label: 'Dodge Chance'
    }
  },
  {
    name: 'alignment',
    base: 0,
    metadata: {
      label: 'Alignment'
    }
  },
  {
    name: 'hunger',
    base: 100,
    metadata: {
      label: 'Hunger'
    }
  },
  {
    name: 'thirst',
    base: 100,
    metadata: {
      label: 'Thirst'
    }
  }
];
