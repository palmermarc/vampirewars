'use strict';

const { Broadcast: B } = require('ranvier');

module.exports = {
  usage: 'clandisc [discname]',
  command: (state) => (args, player) => {

    // Only allow Vamps to use this call
    if( player.getMeta('class') !== 'vampire' ) {
      //return B.sayAt(player, `Only Vampires can user the clandisc ability.`);
    }

    // TODO: Automatically bounce them to their class-appropriate ability
    let playerdiscs = player.getMeta('clandiscs');
    let selectedDiscs = [];
    let possibleDiscs = ['animalism', 'auspex', 'celerity', 'dominate', 'fortitude', 'obfuscate', 'obtenebration', 'potence', 'presence', 'quietus', 'thaumaturgy', 'viccisitude'];

    possibleDiscs.map((disc) => {
      if ( player.getMeta('clandiscs.' + disc) > 0) {
        selectedDiscs.push(disc);
      }
    });

    let maxDiscs = 3;

    if (!args.length) {
      B.sayAt(player, `Your current selected clandiscs are: ` + selectedDiscs.join(', '));
    }

    const [discName] = args.split(' ');

    if (!possibleDiscs.includes(discName)) {
      B.sayAt(player, `That is not an available option. The possible disciplines are:`);
      return B.sayAt(player, possibleDiscs.join(', '));
    }

    if( selectedDiscs.length >= maxDiscs ) {
      return B.sayAt(player, `You cannot learn any more disciplines for now.`);
    }

    // Set the stance then return the messaging
    player.setMeta('clandiscs.'+discName, 1);
    return B.sayAt(player, `You have mastered the discipline of ${discName}`);
  }
};