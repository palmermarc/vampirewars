'use strict';

const ChannelAudience = require('ranvier');

/**
 * Audience class representing everyone in the game, except sender.
 * @memberof ChannelAudience
 * @extends ChannelAudience
 */
class ToreadorAudience extends ChannelAudience {
  getBroadcastTargets() {
    return this.state.PlayerManager.filter(player => player.getMeta('clan') === 'Toreador');
  }
}

module.exports = ToreadorAudience;
