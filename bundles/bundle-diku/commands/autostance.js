'use strict';

const { Broadcast: B } = require('ranvier');

function playerCanUseStance(player, stanceName) {
  const basicStances = ['bull', 'crane', 'mongoose', 'viper'];
  const advancedStances = ['falcon', 'grizzlie', 'lion', 'panther', 'swallow'];

  // Check if they are 200 in the required stances to actually be able to use them
  if(advancedStances.includes(stanceName)) {
    if( stanceName === 'falcon' && (player.getMeta('stanceLevels.mongoose') < 200 || player.getMeta('stanceLevels.bull') < 200)) {
      return false;
    }

    if( stanceName === 'swallow' && (player.getMeta('stanceLevels.mongoose') < 200 || player.getMeta('stanceLevels.crane') < 200)) {
      return false;
    }

    if( stanceName === 'lion' && (player.getMeta('stanceLevels.viper') < 200 || player.getMeta('stanceLevels.bull') < 200)) {
      return false;
    }
    if( stanceName === 'cobra' && (player.getMeta('stanceLevels.crane') < 200 || player.getMeta('stanceLevels.viper') < 200)) {
      return false;
    }

    if( stanceName === 'grizzlie' && (player.getMeta('stanceLevels.crane') < 200 || player.getMeta('stanceLevels.bull') < 200)) {
      return false;
    }

    if( stanceName === 'panther' && (player.getMeta('stanceLevels.mongoose') < 200 || player.getMeta('stanceLevels.viper') < 200)) {
      return false;
    }
  }

  // No need to do any checks, this should only trigger if someone is trying to use a basic stance
  return true;
}

function setPlayerStance(player, stance) {
  player.setMeta('autostance', stance);
}

module.exports = {
  usage: 'autostance [stance name]',
  command: (state) => (args, player) => {
    let currentautostance = player.getMeta('autostance');

    if (!args.length) {
      B.sayAt(player, `<bold>Your current autostance is set to: ${currentautostance}</bold>`);
      B.sayAt(player, ``);
      B.sayAt(player, 'Syntax is: autostance [stance name]');
      B.sayAt(player, `<bold>Basic stances:</bold> Viper, Crane, Mongoose, Bull`);
      return B.sayAt(player, `<bold>Advanced stances:</bold> Falcon, Swallow, Cobra, Lion, Grizzlie, Panther`);
    }

    let possibleStances = ['bull', 'crane', 'mongoose', 'viper', 'cobra', 'falcon', 'grizzlie', 'lion', 'panther', 'swallow', 'none'];

    const [stanceName] = args.split(' ');

    if( stanceName === 'none' ) {
      player.setMeta('autostance', 'none' );
      return B.sayAt(player, 'You have cleared your autostance ... why would you ever want to do that?');
    }

    if (!possibleStances.includes(stanceName)) {
      B.sayAt(player, 'Syntax is: autostance [stance name]');
      B.sayAt(player, `<bold>Basic stances:</bold> Viper, Crane, Mongoose, Bull`);
      return B.sayAt(player, `<bold>Advanced stances:</bold> Falcon, Swallow, Cobra, Lion, Grizzlie, Panther`);
    }

    // If they haven't unlocked the stance yet, bounce them out.
    if( !playerCanUseStance(player, stanceName)){
      return B.sayAt(player, `You have not unlocked the ability to use the ${stanceName} stance, yet`);
    }

    // Set the stance then return the messaging
    player.setMeta('autostance', stanceName);
    return B.sayAt(player, `Your autostance has been set to the ${stanceName} stance.`);
  }
};