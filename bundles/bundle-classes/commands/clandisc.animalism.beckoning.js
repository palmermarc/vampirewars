'use strict';

const { Broadcast: B } = require('ranvier');
const { Random } = require('rando-js');

module.exports = {
  usage: 'beckon',
  aliases: [ 'beckon' ],
  command : (state) => (args, player) => {
    let failure = Random.probability(15);
    if( failure ) {
      return B.sayAt(player, `You beckon for help, but no animals respond.`);
    }

    let playerGen = player.getMeta('generation' );

    let room = player.room;
    B.sayAt(player, `You beckon for help, and a lone wolf responds.`);
    B.sayAtExcept(room, `${player.name} beckons for help, and a lone wolf responds.`, player);

    const lonewolf = new Npc(area, {
      id: 'lonewolf',
      name: `${player.name}'s Guardian Wolf`,
      roomDesc: `${player.name}'s Guardian Wolf stands between you, in order to protect them.`,
      description: `${player.name}'s Guardian Wolf stands between you, in order to protect them`,
      keywords: ['guardian', 'wolf', 'lone'],
      attributes: {
        health: player.attribute.health * (0.85 * (13-playerGen)/4),
        armor: player.attribute.armor * (0.85 * (13-playerGen)/4),
        hit_chance: (70 + (2*(13-playerGen))), // Max of 90% hit chance
        attack_power: player.attribute.attack_power * (0.85 * (13-playerGen)/4),
        alignment: 800
      },
      metadata: {
        autostance: 'lion'
      },
    });

    lonewolf.hydrate(state);

    room.addNpc(lonewolf);

    state.PartyManager.create(player);
    lonewolf.party.add(player);
    player.follow(lonewolf);
  }
};
