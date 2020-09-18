'use strict';

const humanize = (sec) => { return require('humanize-duration')(sec, { round: true }); };
const { Broadcast: B, Config, Logger, SkillErrors } = require('ranvier');
const Combat = require('../bundle-diku-combat/lib/Combat');
const LevelUtil = require('./lib/LevelUtil');
const CombatErrors = require('../bundle-diku-combat/lib/CombatErrors');
const sprintf = require('sprintf-js').sprintf;

module.exports = {
  listeners: {

    /**
     * Handle a player movement command. From: 'commands' input event.
     * movementCommand is a result of CommandParser.parse
     */
    move: state => function (movementCommand) {
      const { roomExit } = movementCommand;

      if(this.getMeta('currentStance') !== 'none') {
        state.CommandManager.get('stance').execute('none', this);
      }

      if (!roomExit) {
        return B.sayAt(this, "You can't go that way!");
      }

      if (this.isInCombat()) {
        return B.sayAt(this, 'You are in the middle of a fight!');
      }

      const nextRoom = state.RoomManager.getRoom(roomExit.roomId);
      const oldRoom = this.room;

      const door = oldRoom.getDoor(nextRoom) || nextRoom.getDoor(oldRoom);

      if (door) {
        if (door.locked) {
          return B.sayAt(this, "The door is locked.");
        }

        if (door.closed) {
          return B.sayAt(this, "The door is closed.");
        }
      }

      this.moveTo(nextRoom, _ => {
        state.CommandManager.get('look').execute('', this);
      });

      B.sayAt(oldRoom, `${this.name} leaves.`);
      B.sayAtExcept(nextRoom, `${this.name} enters.`, this);

      for (const follower of this.followers) {
        if (follower.room !== oldRoom) {
          continue;
        }

        if (follower.isNpc) {
          follower.moveTo(nextRoom);
        } else {
          B.sayAt(follower, `\r\nYou follow ${this.name} to ${nextRoom.title}.`);
          follower.emit('move', movementCommand);
        }
      }
    }
  }
};
