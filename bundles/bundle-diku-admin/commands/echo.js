'use strict';

const { Broadcast: B, PlayerRoles } = require('ranvier');

module.exports = {
  requiredRole: PlayerRoles.ADMIN,
  usage: 'recho <message>',
  command: state => (message, player) => {

    if (!message || !message.length) {
      return B.sayAt(player, 'What do you want to echo to the room?');
    }

    state.PlayerManager.players.forEach((character) => {
      B.sayAt(character, message);
    });

  }
};
