'use strict';

const { Broadcast, EffectFlag } = require('ranvier');

module.exports = {
  config: {
    name: 'Stone Skin',
    description: "Stengthen your skin to reduce the damage you take from physical attacks!",
    duration: 1800 * 1000,
    type: 'buff.stoneskin',
    refreshes: true,
  },
  flags: [EffectFlag.BUFF],
  state: {
    magnitude: 10
  },
  modifiers: {
    attributes: {
      armor: function (current) {
        // If the magnitude is 10, then give them a 10% buff
        return current * (1 + (this.state.magnitude/100) );
      }
    }
  },
  listeners: {
    effectRefreshed: function (newEffect) {
      // For this buff if someone tries to refresh the effect then just restart
      // the duration timer
      this.startedAt = Date.now();
      Broadcast.sayAt(this.target, "Your stone skin has been extended.");
    },

    effectActivated: function () {
      // For buff we'll just send some text to the user
      Broadcast.sayAt(this.target, "You feel someone protecting you.");
    },

    effectDeactivated: function () {
      Broadcast.sayAt(this.target, "You no longer feel protected.");
    }
  }
};