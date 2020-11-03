'use strict';

const { Broadcast: B } = require('ranvier');

module.exports = {
  aliases: [ 'stances', 'basicstances', 'astances' ],
  command: state => (args, player) => {
    let stances = {
      basic: [
        { metaKey: 'stances.bull', rendered: 'bull' },
        { metaKey: 'stances.crane', rendered: 'crane' },
        { metaKey: 'stances.mongoose', rendered: 'mongoose' },
        { metaKey: 'stances.viper', rendered: 'viper' },
      ],
      advanced: [
        { metaKey: 'stances.cobra', rendered: 'cobra' },
        { metaKey: 'stances.falcon', rendered: 'falcon' },
        { metaKey: 'stances.grizzlie', rendered: 'grizzlie' },
        { metaKey: 'stances.lion', rendered: 'lion' },
        { metaKey: 'stances.panther', rendered: 'panther' },
        { metaKey: 'stances.swallow', rendered: 'swallow' }
      ]
    };
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
    B.sayAt(player, B.center(80, '| Basic Stances |' ));
    B.sayAt(player, `-------------------------------------------------------------------------------`);

    stances.basic.map(weapon => {
      let stanceskill = player.getMeta(weapon.metaKey);

      thresholds.map((threshold) => {
        if(stanceskill >= threshold.min && stanceskill <= threshold.max) {
          B.sayAt(player, `You are ${threshold.text} ${weapon.rendered} stances.`);
        }
      });

    });

    B.sayAt(player, `-------------------------------------------------------------------------------`);

    B.sayAt(player, ``);
    B.sayAt(player, ``);

    B.sayAt(player, `-------------------------------------------------------------------------------`);
    B.sayAt(player, B.center(80, '| Advanced Stances |' ));
    B.sayAt(player, `-------------------------------------------------------------------------------`);

    stances.advanced.map(weapon => {
      let stanceskill = player.getMeta(weapon.metaKey);

      thresholds.map((threshold) => {
        if(stanceskill >= threshold.min && stanceskill <= threshold.max) {
          B.sayAt(player, `You are ${threshold.text} ${weapon.rendered} stances.`);
        }
      });

    });

    B.sayAt(player, `-------------------------------------------------------------------------------`);

  }
};