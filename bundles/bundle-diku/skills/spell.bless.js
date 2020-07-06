'use strict';

const { Broadcast, EffectFlag } = require('ranvier');

module.exports = {
  config: {
    name: 'Bless',
    description: "You feel stronger!",
    duration: 1800 * 1000,
    type: 'buff.bless',
    refreshes: true,
  },
  flags: [EffectFlag.BUFF],
  state: {
    magnitude: 10
  },

  modifiers: {
    attributes: {
      hit_roll: function (current) {
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
      Broadcast.sayAt(this.target, "Your blessing has been extended.");
    },

    effectActivated: function () {
      // For buff we'll just send some text to the user
      Broadcast.sayAt(this.target, "You feel righteous.");
    },

    effectDeactivated: function () {
      Broadcast.sayAt(this.target, "You feel less righteous.");
    }
  }
};