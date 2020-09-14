'use strict';

const { Broadcast: B, PlayerRoles } = require('ranvier');

module.exports = {
  requiredRole: PlayerRoles.ADMIN,
  usage: 'info <message>',
  command: state => (message, player) => {

    if (!message || !message.length) {
      return B.sayAt(player, 'What do you want to drop to players as an info announcement?');
    }

    state.PlayerManager.players.forEach((character) => {
      B.sayAt(character, `Info -> ${message}`);
    });

  }
};
