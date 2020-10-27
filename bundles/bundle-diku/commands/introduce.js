'use strict';

const fs = require('fs-extra');
const { Broadcast: B } = require('ranvier');

module.exports = {
	usage: 'finger <player>',
	alias: ['tradition'],
	command: state => (args, player) => {

		if( player.getMeta('class' ) !== 'vampire' ) {
			return B.sayAt( player, `Huh?` );
		}

		if( player.getMeta( 'clan' ) ) {
			return B.sayAt( player, `Not until you've created your own clan!` );
		}

		let vampGen = player.getMeta( 'generation' );
		let generation = '';

		switch( vampGen ) {
			case 12:
				generation = 'Twelfth';
				break;
			case 11:
				generation = 'Eleventh';
				break;
			case 10:
				generation = 'Tenth';
				break;
			case 9:
				generation = 'Ninth';
				break;
			case 8:
				generation = 'Eighth';
				break;
			case 7:
				generation = 'Seventh';
				break;
			case 6:
				generation = 'Sixth';
				break;
			case 5:
				generation = 'Fifth';
				break;
			case 4:
				generation = 'Fourth';
				break;
			case 3:
				generation = 'Third';
				break;
			case 2:
				generation = 'Second';
				break;
		}

		if( vampGen == 1 ) {
			return B.sayAt(player.room, `As is the tradition, I recite the lineage of ${player.name}, Sire of all Kindred.`);
		} else {
			return B.sayAt(player.room, `As is the tradition, I recite the lineage of ${player.name}, Cainite of the ${generation} Generation.`);
		}
	}
};