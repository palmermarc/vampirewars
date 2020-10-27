'use strict';

const { Broadcast: B } = require('ranvier');

const subcommands = new CommandManager();
subcommands.add({
  name: 'spell',
  command: state => (args, player) => {

  }
});

subcommands.add({
  name: 'stance',
  command: state => (args, player) => {

  }
});

subcommands.add({
  name: 'weapon',
  command: state => (args, player) => {

  }
});

subcommands.add({
  name: 'clandisc',
  command: state => (args, player) => {

  }
});

module.exports = {
  usage: 'tier [option]',
  command: (state) => (args, player) => {
    if(!args.length) {
      state.CommandManager.get('THISCOMMANDNAME').execute('list', player);
    }

    let possibleTiers = ['stances', 'weapons', 'spells'];

    // Grab the clandiscs that the player selected and only allow them to tier those clandiscs
    const clandiscs = player.getMeta('clandiscs');
    if(clandiscs) {
      clandiscs.forEach(clandisc => {
        possibleTiers.push(clandisc);
      });
    }


  }
};

function calculateTierCost(player, tier) {

}