'use strict';

const { Broadcast: B } = require('ranvier');

module.exports = {
	usage: 'vampire',
	command: (state) => (args, player) => {
		if( player.getMeta('class') != 'human' ) {
			return B.sayAt(player, `Huh?`);
		}

		const minimumLevel = 50;
		if( player.level < minimumLevel ) {
			const leftToGain = minimumLevel - player.level;
			return B.sayAt(player, `You are not high enough level to do that. You still need to gain ${leftToGain} levels before you reach level ${minimumLevel}.`);
		}

		if( player.getMeta('biteable') ) {
			player.setMeta('biteable', false );
			return B.sayAt( player, "You will no longer allow vampires to bite you." );
		}
		else {
			player.setMeta('biteable', true );
			return B.sayAt( player, "You will now allow vampires to bite you." );
		}
	}
};