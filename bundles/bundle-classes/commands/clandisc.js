'use strict';

const { Broadcast: B } = require('ranvier');

module.exports = {
  usage: 'clandisc [discname]',
  command: (state) => (args, player) => {

    // Only allow Vamps to use this call
    if( player.getMeta('class') !== 'vampire' ) {
      return B.sayAt(player, `Only Vampires can user the clandisc ability.`);
    }

    // TODO: Automatically bounce them to their class-appropriate ability
    let playerdiscs = player.getMeta('clandiscs') || [];
    let selectedDiscs = [];
    //let possibleDiscs = ['animalism', 'auspex', 'celerity', 'dominate', 'fortitude', 'obfuscate', 'obtenebration', 'potence', 'presence', 'quietus', 'thaumaturgy', 'viccisitude'];
    let possibleDiscs = [ 'auspex', 'celerity', 'dominate', 'fortitude', 'mortis', 'potence', 'protean', 'serpentis' ];

    possibleDiscs.map((disc) => {
      if ( player.getMeta('clandiscs.' + disc) > 0) {
        selectedDiscs.push(disc);
      }
    });

    let maxDiscs = 3;

    if (!args.length) {
      B.sayAt(player, `Your have mastered the following disciplines: ` + selectedDiscs.join(', '));

      B.sayAt(player, `\nYou can learn the following disciplines:`);
      return B.sayAt(player, possibleDiscs.join(', '));
    }

    const [discName] = args.split(' ');

    // Check to see if they already have that disc
    let disciplineLevel = player.getMeta(`clandiscs.${discName}`) || 0;

    if(disciplineLevel >= 1) {
      // TODO: Return the discipline powers and actually be useful
      return B.sayAt(player, `You have already mastered the ${discName} discipline.`);
    }

    // If they are trying to learn a disc that doesn't exist, tell them
    if (!possibleDiscs.includes(discName)) {
      B.sayAt(player, `That is not an available option. The possible disciplines are:`);
      return B.sayAt(player, possibleDiscs.join(', '));
    }

    // Don't let them get the disc if they are already at the maximum amount
    if( selectedDiscs.length >= maxDiscs ) {
      return B.sayAt(player, `You cannot learn any more disciplines for now.`);
    }

    // We passed every check we through at the system, give them the disc
    player.setMeta('clandiscs.'+discName, 1);
    return B.sayAt(player, `You have mastered the discipline of ${discName}`);
  }
};