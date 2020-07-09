'use strict';

/**
 * Example real-time combat behavior for NPCs that goes along with the player's player-combat.js
 * Have combat implemented in a behavior like this allows two NPCs with this behavior to fight without
 * the player having to be involved
 */
module.exports = () => {
  return  {
    listeners: {
      /**
       * @param {*} config Behavior config
       */
      spawn: state => function (config) {
        this.setMeta('currentStance', 'none');

        if( !this.getMeta('autostance') ) {
          this.setMeta('autostance', 'crane');
        }
      },
    }
  };
};
