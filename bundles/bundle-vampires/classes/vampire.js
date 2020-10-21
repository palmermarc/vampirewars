'use strict';

/**
 * This example definition of a class file is a guideline. The class system is
 * left intentionally vague so as to not be too opinionated. Class files are
 * assumed to be js files instead of blank yaml files just to future proof the
 * bundle-loading of class files in case someone wants extra functionality in
 * their classes.
 */
module.exports = {
  name: 'Vampire',
  description: 'Vampires are an abomination on this land. A curse, dating back to Caine\'s murder of Abel. They have supernatural strength, speed, and more. While they are incredibly strong, they also have many weaknesses.',

  abilityTable: {
    10: { skills: ['bite', 'clanbalance', 'clandeposit', 'claninfo', 'clanwithdraw', 'discipline', 'favour', 'introduce', 'outcast', 'regenerate', 'tier', 'tradition', 'upkeep', 'vampire', 'vclan'] },
  },

  setupPlayer: (state, player) => {
    player.prompt = '[ %health.current%/%health.max% <b>hp</b> %mana.current%/%mana.max% <b>mana</b> %move.current%/%move.max% <b>mana</b> %blood.current%/%blood.max% <b>blood</b> ]';
  }
};