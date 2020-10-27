'use strict';

const { Broadcast: B } = require('ranvier');

module.exports = {
	usage: 'vclan',
	command: (state) => (args, player) => {
		if( player.getMeta('class' ) !== 'vampire' || player.getMeta('clan') == "" ) {
			return B.sayAt( player, "Huh?" );
		}

		let clan = player.getMeta('clan');

		B.sayAt(player, `The ${clan} clan:`);

		state.PlayerManager.players.forEach((otherPlayer) => {

			let playerClass = otherPlayer.getMeta( 'class' );

			if( playerClass === 'vampire' ) {
				let playerClan = otherPlayer.getMeta( 'clan' );
				let playerGen = otherPlayer.getMeta( 'generation' );

				if( playerClan == clan )
					B.sayAt(player, `${otherPlayer.name} - Gen ${playerGen}`);
			}
		});
	}
};