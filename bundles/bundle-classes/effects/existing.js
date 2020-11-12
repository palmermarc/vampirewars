'use strict';

const { Damage, EffectFlag, Heal } = require('ranvier');

module.exports = {
  config: {
    name: 'Survival',
    description: "Existing is pain. Your body requires nurishment to survive.",
    type: 'survival',
    tickInterval: 3
  },
  flags: [EffectFlag.BUFF],
  state: {
    magnitude: 10,
  },
  listeners: {
    updateTick: function () {
      // pools that regenerate over time
      const regens = [
        { pool: 'hunger', modifier: 5, class: ['human'] },
        { pool: 'thirst', modifier: 5, class: ['human', 'vampire'] }
      ];

      for (const regen of regens) {
        // If the character doesn't have this attribute, then skip it
        if (!this.target.hasAttribute(regen.pool)) {
          continue;
        }

        // If the player isn't in the correct class, skip it
        let playerClass = this.target.getMeta('class');
        if(!regen.class.includes(playerClass)) {
          continue;
        }

        const poolMax = this.target.getMaxAttribute(regen.pool);
        const amount = Math.round((poolMax / 100) * regen.modifier);
        const damage = new Damage(regen.pool, amount, this.target, this, {
          hidden: true,
        });

        damage.commit(this.target);
      }
    },
  }
};
