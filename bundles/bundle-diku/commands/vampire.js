'use strict';

const { Broadcast: B } = require('ranvier');

module.exports = {
	usage: 'vampire',
	command: (state) => (args, player) => {
		if( player.getMeta('class') != 'human' ) {
			return B.sayAt(player, `Huh?`);
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