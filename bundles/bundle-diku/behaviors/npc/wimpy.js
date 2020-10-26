'use strict';

const { Random } = require('rando-js');

/**
 * A simple behavior - if a mob is set to be wimpy, then it will automatically flee if it's current
 * health is below the percentage threshold and it passes a success roll
 * Options:
 *   threshold: number, the percentage of health that wimpy will activate under
 *   fleeChance: number, the percentage of chance it has to successfully flee during combat
 */
module.exports = {
  listeners: {
    updateTick: state => function (config) {
      if( !this.IsInCombat() ) {
        return;
      }

      if (config === true) {
        config = {};
      }

      config = Object.assign({
        threshold: 25,
        fleeChance: 33,
      }, config);

      // The mob is in combat, so let's see if we should
      let currentHealth = this.getAttribute('health');

      // Mobs have a 10% chance to auto-flee once they are under 25%
      if( (currentHealth > (this.getMaxAttribute('health')) * (config.fleeChance/100)) && Random.probability(config.fleeChance) ) {
        state.CommandManager.get('flee').execute('', this);
      }
    }
  }
};
