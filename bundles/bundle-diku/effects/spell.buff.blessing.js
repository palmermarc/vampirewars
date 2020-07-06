'use strict';

const { Broadcast, EffectFlag } = require('ranvier');

module.exports = {
  config: {
    // Name of effect shown when the player uses the `effects` command
    name: 'Buff Strength',
    description: "You feel stronger!",

    // Optional duration of this effect in milliseconds. Defaults to Infinity
    duration: 30 * 1000,

    /*
    Type is an optional config which is used in conjunction with the
    `unique` config option (defaults to true). If an effect is unique only one
    effect of that type may be active at once.
    */
    type: 'buff.strength',

    /**
     * This will configure the effect so that if another effect of the same
     * type is applied before the effect is finished it will receive a
     * "effectRefreshed" event to do with as it will.
     */
    refreshes: true,
  },

  /*
  Effect flags are completely optional and _arbitrary_ values that you can place
  in the `flags` array and then read later. By default flags are only used by the
  `bundle-example-effects` bundle's `effects` command to color an active effect
  red or green. You can import flags from anywhere you want or simply hard code
  strings. The EffectFlag enum from src/ is just an _example_ implementation.
  */
  flags: [EffectFlag.BUFF],

  /*
  State, like quest state, is where you keep track of the current state of the
  effect. This may include things like how many stacks of this effect there
  are, the magnitude of an effect, etc. In buff effect a magnitude of 5
  indicates that we want to increase the target's attribute by 5
  */
  state: {
    magnitude: 5
  },

  /*
  The modifiers property is where you implement formulas for changing
  character attributes as well as incoming/outgoing damage.
  */
  modifiers: {
    /*
    The attributes sub-property lets you define which attributes are modified
    by this effect.
    */
    attributes: {
      // For `buff` we just want to take the character's current strength and
      // increase it by this effect's `magnitude`
      strength: function (current) {
        return current + this.state.magnitude;
      }
    }
  },
  /*
  Alternatively, if the attribute you're modifying is dynamic you can use
  this pattern which is used when you want a base effect that could apply
  to multiple attributes.  See the `equip.js` effect for an example

  state: {
    stat: 'strength',
    bonus: 5
  },

  modifiers: {
    attributes: function (attribute, current) {
      if (attribute !== this.state.stat) {
        return current;
      }

      return current + this.state.bonus;
    }
  },
  */

  /*
  Similar to quests, effects receive all the events the player receives in
  addition to a few special events specific to events. The special events are:
    effectAdded: The effect has been added to the character's effect list but
      is not yet activated.
    effectActivated: The effect is activated for the character
    effectDeactivated: The effect is about to be removed from the effect list
  */
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