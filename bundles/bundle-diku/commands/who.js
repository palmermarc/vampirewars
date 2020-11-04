'use strict';

const { Broadcast: B } = require('ranvier');

module.exports = {
  usage: 'who',
  command: (state) => (args, player) => {
    B.sayAt(player, "<bold><red>                  Who's Online</bold></red>");
    B.sayAt(player, "<bold><red>===============================================</bold></red>");
    B.sayAt(player, '');

    state.PlayerManager.players.forEach((otherPlayer) => {
      let playerTitle = otherPlayer.getMeta('title');
      B.sayAt(player, `${otherPlayer.name}${playerTitle}`);
    });

    B.sayAt(player, state.PlayerManager.players.size + ' total');

    function getRoleString(role = 0) {
      return [
        '',
        '<white>[Builder]</white>',
        '<b><white>[Admin]</white></b>'
      ][role] || '';
    }
  }
};
