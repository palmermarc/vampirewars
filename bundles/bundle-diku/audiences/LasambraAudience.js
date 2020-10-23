'use strict';

const ChannelAudience = require('ranvier');

/**
 * Audience class representing everyone in the game, except sender.
 * @memberof ChannelAudience
 * @extends ChannelAudience
 */
class LasambraAudience extends ChannelAudience {
  getBroadcastTargets() {
    return this.state.PlayerManager.filter(player => player.getMeta('clan') === 'Lasambra');
  }
}

module.exports = LasambraAudience;
