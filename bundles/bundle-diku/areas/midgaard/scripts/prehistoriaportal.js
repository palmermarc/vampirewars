'use strict';

const { Broadcast: B} = require('ranvier');

module.exports = {
	listeners: {
		channelReceive: state => function (channel, sender, message) {
			if (channel.name !== 'say') {
				return;
			}

			if (!message.toLowerCase().match('take me home')) {
				return;
			}

			if(sender.level > 35) {
				return B.sayAt(sender, `You are NOT a newbie and therefore cannot access that area!`);
			}

			let room = state.RoomManager.getRoom('prehistoria:r11200');

			sender.moveTo(home, () => {
				B.sayAt(sender, `A portal opens before you and pulls you in.`);
				B.sayAtExcept(sender.room, `${sender.name} disappears.`, sender);
				state.CommandManager.get('look').execute('', sender);
			});


		},
	}
};