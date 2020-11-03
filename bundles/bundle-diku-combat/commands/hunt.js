'use strict';

const { Broadcast: B } = require('ranvier');
const Path = require('../lib/PathfindingUtil');
const Parser = require('../../bundle-diku/lib/ArgParser');

module.exports = {
  usage: 'hunt [target]',
  command: (state) => (args, player) => {
    if (!args.length) {
      return B.sayAt(player, `Whom are you trying to hunt?`);
    }

    if (args == "clear") {
      player.setMeta('isHunting', 0);
      return B.sayAt(player, `Your hunt target has been cleared.`);
    }

    if (player.isInCombat()) {
      return B.sayAt(player, `You can't run away from combat!`);
    }

    // This block should be the same as in TELEPORT, but didn't feel it deserved being put into a function at this time.
    let targetRoom = null;

    const { area } = player.room;

    //let target = Parser.parseDot(dest, player.visiblePlayersOnline) || Parser.parseDot(dest, state.MobManager.getMobs());
    const target = Parser.parseDot(args, player.visiblePlayersOnline) || Parser.parseDot(args, area.npcs);

    if (!target) {
      return B.sayAt(player, 'No such mob.');
    }

    targetRoom = target.room;

    if (!targetRoom) {
      return B.sayAt(player, 'No such room exists.');
    }

    player.setMeta('isHunting', 1);
    //player.setMeta('huntingTarget', target );

    if (targetRoom === player.room) {
      return B.sayAt(player, `<yellow>${target.name} is here!</yellow>`);
    }

    const path = Path.findPathInContinent(state, player, targetRoom);

    if (!path) {
      return B.sayAt(player, `Can't find a path to ${targetRoom.name}.`);
    }

    return B.sayAt(player, `<yellow>${target.name} is ${path[0].direction} from here.</yellow>`);

  }
};