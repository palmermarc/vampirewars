'use strict';

const { Broadcast: B } = require('ranvier');

module.exports = {
  aliases: [ 'weapons' ],
  command: state => (args, player) => {
    let weapons = [
      { metaKey: 'weapons.hit', rendered: 'hitting' },
      { metaKey: 'weapons.slice', rendered: 'slicing' },
      { metaKey: 'weapons.stab', rendered: 'stabbing' },
      { metaKey: 'weapons.slash', rendered: 'slashing' },
      { metaKey: 'weapons.whip', rendered: 'whipping' },
      { metaKey: 'weapons.claw', rendered: 'clawing' },
      { metaKey: 'weapons.blast', rendered: 'blasting' },
      { metaKey: 'weapons.pound', rendered: 'pounding' },
      { metaKey: 'weapons.crush', rendered: 'crushing' },
      { metaKey: 'weapons.grep', rendered: 'grepping' },
      { metaKey: 'weapons.bite', rendered: 'biting' },
      { metaKey: 'weapons.pierce', rendered: 'piercing' },
      { metaKey: 'weapons.suck', rendered: 'sucking' }
    ];

    let thresholds = [
      {
        min: 0,
        max: 25,
        text: "a complete newbie in"
      },
      {
        min: 26,
        max: 50,
        text: "slightly unskilled in"
      },
      {
        min: 51,
        max: 75,
        text: "fairly competent in",
      },
      {
        min: 76,
        max: 100,
        text: "highly skilled in",
      },
      {
        min: 101,
        max: 125,
        text: "very dangerous in",
      },
      {
        min: 126,
        max: 150,
        text: "extremely deadly in",
      },
      {
        min: 151,
        max: 175,
        text: "an expert in",
      },
      {
        min: 175,
        max: 198,
        text: "a master in",
      },
      {
        min: 199,
        max: 199,
        text: "on the verge of grand mastery of",
      },
      {
        min: 200,
        max: 2500,
        text: "a grand mastery of",
      }
    ];

    B.sayAt(player, `-------------------------------------------------------------------------------`);
    B.sayAt(player, `                                 |  Weapons |                                  `);
    B.sayAt(player, `-------------------------------------------------------------------------------`);

    weapons.map(weapon => {
      let weaponSkill = player.getMeta(weapon.metaKey);

      thresholds.map((threshold) => {
        if(weaponSkill >= threshold.min && weaponSkill <= threshold.max) {
          B.sayAt(player, `You are ${threshold.text} ${weapon.rendered} weapons.`);
        }
      });

    });

    B.sayAt(player, `-------------------------------------------------------------------------------`);

  }
};