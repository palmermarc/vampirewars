'use strict';

const srcPath = __dirname + '/../../../src/';
const { Logger } = require('ranvier');

exports.findPathInContinent = (state, ch, targetRoom) => {

  const searchRooms = [...state.RoomManager.rooms.values()].filter(room => {
    return true;
  });

  return findPath(state, ch, targetRoom, searchRooms);
}

function findPath(state, ch, targetRoom, searchRooms) {
  const startRoom = ch.room;

  // Set all rooms that are being searched to Infinite cost to get there.
  const mvCosts = {};
  for (const room of searchRooms) {
    mvCosts[room.entityReference] = Infinity;
  }

  mvCosts[startRoom.entityReference] = 0;

  const backtrace = {};
  const pq = new PriorityQueue();

  Logger.log('Made it this far...');

  // Add the first room to queue, then add its exits, etc.
  pq.enqueue(startRoom);
  while (!pq.isEmpty()) {
    const current = pq.dequeue();
    for (const exit of current.exits) {

      const neighbor = state.RoomManager.getRoom(exit.roomId);

      // const door = current.getDoor(neighbor) || neighbor.getDoor(current);
      // if (door) { continue };

      // If cost to get to neighbor room is less than any current path to get there,
      // record that cost to compare later. We start at Inifity for this reason.
      const cost = mvCosts[current.entityReference] + 1;
      if (cost < mvCosts[neighbor.entityReference]) {
        mvCosts[neighbor.entityReference] = cost;
        backtrace[neighbor.entityReference] = { tarER: current.entityReference, direction: exit.direction };
        pq.enqueue(neighbor);
      }
    }
  }

  Logger.log('Made it past the pq stuff');

  Logger.log('We found a path, sweet!');

  // Use backtrace to construct the optimal path
  let path = [{ tarER: targetRoom.entityReference, direction: null }];
  let lastStep = { tarER: targetRoom.entityReference };
  while (lastStep.tarER !== startRoom.entityReference) {
    path.unshift(backtrace[lastStep.tarER]);
    lastStep = backtrace[lastStep.tarER];
  }

  Logger.log('We should be getting close...');

  Logger.log('path Length:', path.length, 'roomsbacktrace', Object.keys(backtrace).length, 'moves', mvCosts[targetRoom.entityReference], 'mvCosts', Object.keys(mvCosts).length, 'count', pq.count)
  return path;
};

class PriorityQueue {
  constructor() {
    this.queue = [];
    this.count = 0;
  }

  enqueue(room) {
    if (this.isEmpty()) {
      this.queue.push(room);
    } else {
      this.count++;
      let added = false;
      for (let i = 1; i <= this.queue.length; i++) {
        if (room.movementCost < this.queue[i - 1].movementCost) {
          this.queue.splice(i - 1, 0, room);
          added = true;
          break;
        }
      }
      if (!added) {
        this.queue.push(room);
      }
    }
  };


  dequeue() {
    return this.queue.shift();
  };

  isEmpty() {
    return (this.queue.length === 0)
  };

}