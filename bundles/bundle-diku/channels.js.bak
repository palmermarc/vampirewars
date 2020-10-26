'use strict';

const {
  AreaAudience,
  PartyAudience,
  PrivateAudience,
  RoomAudience,
  WorldAudience,
} = require('ranvier');
const AssamiteAudience = require('./audiences/AssamiteAudience');
const ImmortalAudience = require('./audiences/ImmortalAudience');
const LasambraAudience = require('./audiences/LasambraAudience');
const ToreadorAudience = require('./audiences/ToreadorAudience');
const TremereAudience = require('./audiences/TremereAudience');
const TzimisceAudience = require('./audiences/TzimisceAudience');
const VampAudience = require('./audiences/VampAudience');
const VentrueAudience = require('./audiences/VentrueAudience');

const { Channel } = require('ranvier').Channel;

module.exports = [
  new Channel({
    name: 'chat',
    aliases: ['.'],
    color: ['bold', 'green'],
    description: 'Chat with everyone on the game',
    audience: new WorldAudience()
  }),

  new Channel({
    name: 'say',
    color: ['yellow'],
    description: 'Send a message to all players in your room',
    audience: new RoomAudience(),
    formatter: {
      sender: function (sender, target, message, colorify) {
        return colorify(`You say: '${message}'`);
      },

      target: function (sender, target, message, colorify) {
        return colorify(`${sender.name} says: '${message}'`);
      }
    }
  }),

  new Channel({
    name: 'tell',
    color: ['bold', 'cyan'],
    description: 'Send a private message to another player',
    audience: new PrivateAudience(),
    formatter: {
      sender: function (sender, target, message, colorify) {
        return colorify(`You tell ${target.name}, '${message}'`);
      },

      target: function (sender, target, message, colorify) {
        return colorify(`${sender.name} tells you, '${message}'`);
      }
    }
  }),

  new Channel({
    name: 'yell',
    color: ['bold', 'red'],
    description: 'Send a message to everyone in your area',
    audience: new AreaAudience(),
    formatter: {
      sender: function (sender, target, message, colorify) {
        return colorify(`You yell, '${message}'`);
      },

      target: function (sender, target, message, colorify) {
        return colorify(`Someone yells from nearby, '${message}'`);
      }
    }
  }),

  new Channel({
    name: 'gtell',
    color: ['bold', 'green'],
    description: 'Send a message to everyone in your group, anywhere in the game',
    audience: new PartyAudience(),
    formatter: {
      sender: function (sender, target, message, colorify) {
        return colorify(`You tell the group, '${message}'`);
      },

      target: function (sender, target, message, colorify) {
        return colorify(`${sender.name} tells the group, '${message}'`);
      }
    }
  }),

  new Channel({
    name: 'vtalk',
    color: ['bold', 'green'],
    description: 'Send a message to all vampires anywhere in the game',
    audience: new VampAudience(),
    formatter: {
      sender: function (sender, target, message, colorify) {
        return colorify(`[Kindred]:<${sender.name}>: ${message}`);
      },

      target: function (sender, target, message, colorify) {
        return colorify(`[Kindred]:<${sender.name}>: ${message}`);
      }
    }
  }),

  new Channel({
    name: 'assatalk',
    color: ['bold', 'green'],
    description: 'Send a message to all Assamite vampires',
    audience: new AssamiteAudience(),
    formatter: {
      sender: function (sender, target, message, colorify) {
        return colorify(`<${sender.name}> ${message}`);
      },

      target: function (sender, target, message, colorify) {
        return colorify(`<${sender.name}> ${message}`);
      }
    }
  }),

  new Channel({
    name: 'lastalk',
    color: ['bold', 'green'],
    description: 'Send a message to all Lasambra vampires',
    audience: new LasambraAudience(),
    formatter: {
      sender: function (sender, target, message, colorify) {
        return colorify(`<${sender.name}> ${message}`);
      },

      target: function (sender, target, message, colorify) {
        return colorify(`<${sender.name}> ${message}`);
      }
    }
  }),

  new Channel({
    name: 'tortalk',
    color: ['bold', 'green'],
    description: 'Send a message to all Toreador vampires',
    audience: new ToreadorAudience(),
    formatter: {
      sender: function (sender, target, message, colorify) {
        return colorify(`<${sender.name}> ${message}`);
      },

      target: function (sender, target, message, colorify) {
        return colorify(`<${sender.name}> ${message}`);
      }
    }
  }),

  new Channel({
    name: 'tremtalk',
    color: ['bold', 'green'],
    description: 'Send a message to all Tremere vampires',
    audience: new TremereAudience(),
    formatter: {
      sender: function (sender, target, message, colorify) {
        return colorify(`<${sender.name}> ${message}`);
      },

      target: function (sender, target, message, colorify) {
        return colorify(`<${sender.name}> ${message}`);
      }
    }
  }),

  new Channel({
    name: 'tzitalk',
    color: ['bold', 'green'],
    description: 'Send a message to all Tzimisce vampires',
    audience: new TzimisceAudience(),
    formatter: {
      sender: function (sender, target, message, colorify) {
        return colorify(`<${sender.name}> ${message}`);
      },

      target: function (sender, target, message, colorify) {
        return colorify(`<${sender.name}> ${message}`);
      }
    }
  }),

  new Channel({
    name: 'ventalk',
    color: ['bold', 'green'],
    description: 'Send a message to all Ventrue vampires',
    audience: new VentrueAudience(),
    formatter: {
      sender: function (sender, target, message, colorify) {
        return colorify(`<${sender.name}> ${message}`);
      },

      target: function (sender, target, message, colorify) {
        return colorify(`<${sender.name}> ${message}`);
      }
    }
  }),
];