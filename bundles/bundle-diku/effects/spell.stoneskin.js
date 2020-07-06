'use strict';

const { Broadcast, EffectFlag } = require('ranvier');

module.exports = {
  config: {
    // Name of effect shown when the player uses the `effects` command
    name: 'Stone Skin',
    description: "You feel stronger!",
    duration: 30 * 1000,
    type: 'buff.strength',
    refreshes: true,
  },
  flags: [EffectFlag.BUFF],
  state: {
    magnitude: 5
  },
  modifiers: {
    attributes: {
      // For `buff` we just want to take the character's current strength and
      // increase it by this effect's `magnitude`
      strength: function (current) {
        return current + this.state.magnitude;
      }
    }
  },
  listeners: {
    effectRefreshed: function (newEffect) {
      // For this buff if someone tries to refresh the effect then just restart
      // the duration timer
      this.startedAt = Date.now();
      Broadcast.sayAt(this.target, "You refresh the potion's magic.");
    },

    effectActivated: function () {
      // For buff we'll just send some text to the user
      Broadcast.sayAt(this.target, "Strength courses through your veins!");
    },

    effectDeactivated: function () {
      Broadcast.sayAt(this.target, "You feel weaker.");
    }
  }
};