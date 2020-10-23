'use strict';

const ChannelAudience = require('ranvier');

/**
 * Audience class representing everyone in the game, except sender.
 * @memberof ChannelAudience
 * @extends ChannelAudience
 */
class ImmortalAudience extends ChannelAudience {
  getBroadcastTargets() {
    return this.state.PlayerManager.filter(player => player.getMeta('immortal') === 1);
  }
}

module.exports = ImmortalAudience;
