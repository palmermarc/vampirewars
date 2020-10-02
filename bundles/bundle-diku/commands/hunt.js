'use strict';

const { Broadcast: B, Logger } = require('ranvier');
const Path = require('../PathfindingUtil');
const Parser = require('..//lib/ArgParser');

function gotoRoom(state, targetMob, targetRoom, player) {
  if (targetRoom === player.room) {
    return B.sayAt(player, `You're already there.`);
  }

  const path = Path.findPathInContinent(state, player, targetRoom);

  if (!path) {
    return B.sayAt(player, `Can't find a path to ${targetRoom.name}.`);
  }

  Logger.log(path);

  return B.sayAt(player, `<yellow>${targetMob.name} is ${path[0].direction} from here.</yellow>`);

  //const dirs = path.map(p => p.direction).filter(Boolean);
  //const parsedDirs = dirs.map(dir => dir[0]).join('');
  //player.socket.emit('queue-command', player, 'speedwalk ' + parsedDirs);
}

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

    let [dest,] = args.match(/^(\S+)?\s?(\S+)?\s*/).slice(1);
    dest = dest.toLowerCase();

    // replace brackets for lazy gods to copy paste entityReferences
    dest = dest.replace(/[><\[\]]+/g, '');

    // This block should be the same as in TELEPORT, but didn't feel it deserved being put into a function at this time.
    let targetRoom = null;
    if (dest.includes(':') || !isNaN(dest)) {
      let findAreaPartial, area;
      if (dest.includes(':')) {
        const [areaSearch, roomNum] = dest.split(":");
        findAreaPartial = STU.bestMatch(areaSearch, [...state.AreaManager.areas.keys()]);
        area = state.AreaManager.getArea(findAreaPartial);
        targetRoom = state.RoomManager.getRoom(findAreaPartial + ':' + roomNum);
      } else {
        area = player.room.area;
        targetRoom = state.RoomManager.getRoom(area.name + ':' + dest);
      }

      // Can find area, but not room. Display room numbers
      if (!targetRoom && (findAreaPartial || !dest.includes(':'))) {
        const rooms = [];
        for (const room of [...area.rooms.keys()]) {
          rooms.push(`<cyan>${room}</cyan>`);
        }
        B.sayAt(player, `<yellow>Possible Rooms in <b><cyan>${area.name}</cyan></b>: ${rooms.join(',')}</yellow>`, 80);
      }

    } else {
      // Don't allow players to be hunted for now
      const { area } = player.room;

      //let target = Parser.parseDot(dest, player.visiblePlayersOnline) || Parser.parseDot(dest, state.MobManager.getMobs());
      const target = Parser.parseDot(args, area.npcs);

      if (!target) {
        return B.sayAt(player, 'No such mob.');
      }

      targetRoom = target.room;

      if (!targetRoom) {
        return B.sayAt(player, 'No such room exists.');
      }

      player.setMeta('isHunting', 1);

      gotoRoom(state, target, targetRoom, player);
    }
  }
};