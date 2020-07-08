'use strict';

const { Broadcast: B } = require('ranvier');

const stances = {
  bull: {
    stanceType: 'basic',
    requires: [],
    sayToPlayer: 'You hunch down into the bull fighting stance.',
    sayToRoom: 'hunches down into the bull fighting stance.',
  },
  crane: {
    stanceType: 'basic',
    requires: [],
    sayToPlayer: 'You swing your body into the crane fighting stance.',
    sayToRoom: 'swings into the crane fighting stance.',
  },
  mongoose: {
    stanceType: 'basic',
    requires: [],
    sayToPlayer: 'You twist into the mongoose fighting stance.',
    sayToRoom: 'twists into the mongoose fighting stance.',
  },
  viper: {
    stanceType: 'basic',
    requires: [],
    sayToPlayer: 'You arch your body into the viper fighting stance.',
    sayToRoom: 'arches into the viper fighting stance.',
  },
  falcon: {
    stanceType: 'advanced',
    requires: ['mongoose', 'bull'],
    sayToPlayer: 'You flow into the falcon fighting stance.',
    sayToRoom: 'flows into the falcon fighting stance!',
  },
  swallow: {
    stanceType: 'advanced',
    requires: ['mongoose', 'crane'],
    sayToPlayer: 'You spread yourself into the swallow fighting stance.',
    sayToRoom: 'spreads into the swallow fighting stance!',
  },
  lion: {
    stanceType: 'advanced',
    requires: ['viper', 'bull'],
    sayToPlayer: 'You fall into the lion fighting stance.',
    sayToRoom: 'falls into the lion fighting stance!',
  },
  cobra: {
    stanceType: 'advanced',
    requires: ['crane', 'viper'],
    sayToPlayer: 'You twist into the cobra fighting stance.',
    sayToRoom: 'twists into the cobra fighting stance!',
  },
  grizzlie: {
    stanceType: 'advanced',
    requires: ['crane', 'bull'],
    sayToPlayer: 'You swell into the grizzlie fighting stance.',
    sayToRoom: 'swells into the grizzle fighting stance!',
  },
  panther: {
    stanceType: 'advanced',
    requires: ['mongoose', 'viper'],
    sayToPlayer: 'You leap into the panther fighting stance.',
    sayToRoom: 'leaps into the panther fighting stance!',
  }
};

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
  player.setMeta('currentStance', stance);
}

module.exports = {
  usage: 'stance [setting]',
  command: (state) => (args, player) => {
    if (!args.length) {
      if( player.getMeta('currentStance') === 'none' ) {
        return B.sayAt(player, 'You are already unstanced, weirdo.');
      }

      // They provided nothing, so force them into no stance
      setPlayerStance(player, 'none');

      B.sayAt(player, 'You relax from your fighting stance');
      B.sayAtExcept(player.room, `${player.name} relaxes into a <bold>fighting stance</bold>!`, [player]);
    }

    let possibleStances = ['bull', 'crane', 'mongoose', 'viper', 'cobra', 'falcon', 'grizzlie', 'lion', 'panther', 'swallow', 'none'];

    const [stanceName] = args.split(' ');

    if (!possibleStances.includes(stanceName)) {
      B.sayAt(player, 'Syntax is: stance stancename');
      B.sayAt(player, `<bold>Basic stances:</bold> Viper, Crane, Mongoose, Bull`);
      return B.sayAt(player, `<bold>Advanced stances:</bold> Falcon, Swallow, Cobra, Lion, Grizzlie, Panther`);
    }

    if( stanceName === 'none' ) {
      // They provided nothing, so force them into no stance
      setPlayerStance(player, 'none');

      B.sayAt(player, 'You relax from your fighting stance');
      return B.sayAtExcept(player.room, `${player.name} relaxes into a <bold>fighting stance</bold>!`, [player]);
    }

    // If they haven't unlocked the stance yet, bounce them out.
    if( !playerCanUseStance(player, stanceName)){
      return B.sayAt(player, `You have not unlocked the ability to use the ${stanceName} stance, yet`);
    }

    // Set the stance then return the messaging
    setPlayerStance(player, stanceName);
    B.sayAt(player, `${stances[stanceName].sayToPlayer}`);
    return B.sayAtExcept(player.room, `${player.name} ${stances[stanceName].sayToRoom}`, [player]);
  }
};