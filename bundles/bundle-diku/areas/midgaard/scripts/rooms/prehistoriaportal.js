'use strict';

const { Broadcast: B, Logger} = require('ranvier');

module.exports = {
	listeners: {
		channelReceive: state => function (channel, sender, message) {
			if (channel.name !== 'say') {
				return;
			}

			Logger.log(message);

			if (!message.toLowerCase().match('take me home')) {
				return;
			}

			if(sender.level > 35) {
				Logger.log(`${sender.name} is too high of level for the newbie zone!`);
				return B.sayAt(sender, `You are NOT a newbie and therefore cannot access that area!`);
			}

			let room = state.RoomManager.getRoom('prehistoria:r11200');

			sender.moveTo(room, () => {
				B.sayAt(sender, `A portal opens before you and pulls you in.`);
				B.sayAtExcept(sender.room, `${sender.name} disappears.`, sender);
				state.CommandManager.get('look').execute('', sender);
			});


		},
	}
};