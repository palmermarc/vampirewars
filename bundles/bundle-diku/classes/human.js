'use strict';

/**
 * This example definition of a class file is a guideline. The class system is
 * left intentionally vague so as to not be too opinionated. Class files are
 * assumed to be js files instead of blank yaml files just to future proof the
 * bundle-loading of class files in case someone wants extra functionality in
 * their classes.
 */
module.exports = {
  name: 'Human',
  description: 'Humans are ordinary men and women in the world.',

  abilityTable: {
    1: { spells: ['acid breath', 'acid blast', 'energy drain', 'fire breath', 'fireball', 'frost breath', 'gas breath', 'heal', 'lightning breath', 'pyroblast'] },
  },


  setupPlayer: (state, player) => {
    player.prompt = '[ %health.current%/%health.max% <b>hp</b> %mana.current%/%mana.max% <b>mana</b> %move.current%/%move.max% <b>mana</b> ]';
  }
};
