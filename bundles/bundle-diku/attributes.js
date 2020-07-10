'use strict';

module.exports = [
  {
    name: 'health',
    base: 500,
    metadata: {
      label: 'Health',
    },
    formula: {
      requires: [],
      fn: function (character, health) {
        let levelBonus = ( Math.ceil( character.level/100 ) ) * 25;
        return health + levelBonus;
      },
    },
  },
  {
    name: 'mana',
    base: 500,
    metadata: {
      label: 'Mana',
    },
    formula: {
      requires: [],
      fn: function (character, mana) {
        let levelBonus = ( Math.ceil( character.level/100 ) ) * 25;
        return mana + levelBonus;
      },
    },
  },
  {
    name: 'move',
    base: 500,
    metadata: {
      label: 'Move',
    },
    formula: {
      requires: [],
      fn: function (character, move) {
        let levelBonus = ( Math.ceil( character.level/100 ) ) * 25;
        return move + levelBonus;
      },
    },
  },
  {
    name: 'strength',
    base: 25,
    metadata: {
      label: 'Strength',
    },
    formula: {
      requires: [],
      fn: function (character, strength) {
        let levelBonus = ( Math.ceil( character.level/100 ) ) * 2;
        return strength + levelBonus;
      },
    },
  },
  {
    name: 'intellect',
    base: 25,
    metadata: {
      label: 'Intellect',
    },
    formula: {
      requires: [],
      fn: function (character, intellect) {
        let levelBonus = ( Math.ceil( character.level/100 ) ) * 2;
        return intellect + levelBonus;
      },
    },
  },
  {
    name: 'wisdom',
    base: 25,
    metadata: {
      label: 'Wisdom',
    },
    formula: {
      requires: [],
      fn: function (character, wisdom) {
        let levelBonus = ( Math.ceil( character.level/100 ) ) * 2;
        return wisdom + levelBonus;
      },
    },
  },
  {
    name: 'dexterity',
    base: 25,
    metadata: {
      label: 'Dexterity',
    },
    formula: {
      requires: [],
      fn: function (character, dexterity) {
        let levelBonus = ( Math.ceil( character.level/100 ) ) * 2;
        return dexterity + levelBonus;
      },
    },
  },
  {
    name: 'constitution',
    base: 25,
    metadata: {
      label: 'Constitution'
    },
    formula: {
      requires: [],
      fn: function (character, constitution) {
        let levelBonus = ( Math.ceil( character.level/100 ) ) * 2;
        return constitution + levelBonus;
      },
    },
  },
  {
    // Need to figure out armor scaling...
    name: 'armor',
    base: 25,
    metadata: {
      label: 'Armor',
    },
  },
  {
    // Need to figure out armor scaling...
    name: 'dodge',
    base: 5,
    metadata: {
      label: 'Dodge',
    },
  },
  {
    // Need to figure out armor scaling...
    name: 'parry',
    base: 5,
    metadata: {
      label: 'Parry',
    },
  },
  {
    name: 'attack_power',
    base: 10,
    metadata: {
      classModifiers: {
        vampire: 2,
        werewolf: 2.5,
        mage: 0.5,
        human: 1,
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
    name: 'critical_strike',
    base: 5,
    metadata: {
      label: 'Critical Strike',
      classModifiers: {
        vampire: 1,
        werewolf: 1,
        mage: 0.25, // Mages get less crit because their spells have base crit conditions built in
        human: 1,
        _default: 1,
      },
    },
    formula: {
      requires: ['dexterity'],
      fn: function (character, critical_strike, dexterity) {
        const characterClass = character.getMeta('class') || '_default';
        const modifier = this.metadata.classModifiers[characterClass];
        return critical_strike + (dexterity * modifier);
      },
    }
  },
  /**
   * Spell power for vampires will impact how hard their non-physical abilities hit for,
   * including enchantments.
   */
  {
    name: 'spell_power',
    base: 10,
    metadata: {
      label: 'Spell Power',
      classModifiers: {
        vampire: 0.5,
        werewolf: 0.5,
        mage: 2,
        human: 1,
        _default: 1,
      },
    },
    formula: {
      requires: ['intellect'],
      fn: function (character, spell_power, intellect) {
        const characterClass = character.getMeta('class') || '_default';
        const modifier = this.metadata.classModifiers[characterClass];
        return spell_power + (intellect * modifier);
      },
    }
  },
  {
    name: 'hitroll', // 100 hitroll is 1% chance to hit
    base: 5,
  },
  {
    name: 'damroll',
    base: 5,
  },
  {
    name: 'alignment',
    base: 0,
  },
  {
    name: 'svs',
    base: 5,
    metadata: {
      'label': 'Save vs. Spell'
    }
  }
];
