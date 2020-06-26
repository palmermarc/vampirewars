'use strict';

/**
 * This example definition of a class file is a guideline. The class system is
 * left intentionally vague so as to not be too opinionated. Class files are
 * assumed to be js files instead of blank yaml files just to future proof the
 * bundle-loading of class files in case someone wants extra functionality in
 * their classes.
 */
module.exports = {
  name: 'Mage',
  description: 'Mages...',

  abilityTable: {
    3: { skills: ['bite'] },
    4: { skills: ['claw'] },
  },

  setupPlayer: (state, player) => {
    const energy = state.AttributeFactory.create('energy', 100);
    player.addAttribute(energy);
    player.prompt = '[ %health.current%/%health.max% <b>hp</b> %energy.current%/%energy.max% <b>energy</b> ]';
  }
};
