'use strict';

const { Broadcast:B } = require('ranvier');
const ArgParser = require('../lib/ArgParser');
const ItemUtil = require('../lib/ItemUtil');

module.exports = {
	usage: 'favour <player> <prince/sire>',
	command : (state) => (args, player) => {
		args = args.trim();

		if ( !args.length || player.getMeta('class') !== 'vampire' || player.getMeta('rank') !== 'justicar' ) {
			return B.sayAt(player, 'Huh?');
		}

		const possibleRanks = ['prince', 'sire'];
		const [targetRecip, rank] = args.split(' ');

		let target = ArgParser(targetRecip, player.room.players);

		if( possibleRanks.includes(rank) ) {
			return B.sayAt( player, `Huh?` );
		}

		if( !target ) {
			return B.sayAt(player, `They aren't here.`);
		}

		if( target == player ) {
			return B.sayAt(player, `Nice try.`);
		}

		if( target.getMeta('class') !== 'vampire' ) {
			return B.sayAt(player, `They are not a vampire.`);
		}

		if( player.getMeta('clan') !== target.getMeta('clan'))  {
			return B.sayAt( player, `You can only grant your favour to someone in your clan.`);
		}

		if( player.getMeta('generation') >= target.getMeta( 'generation' ) ) {
			return B.sayAt(player, `You can only grant your favour to someone of a lower generation.`);
		}

		// We made it past all of the checks.. Just do it!
		if( rank === 'prince' ) {
			if( target.getMeta('favour' === 'prince' ) ) {
				target.setMeta('favour', '');
				B.sayAt(player, `You remove ${target.name}'s prince privileges!`);
				B.sayAt(target, `${player.name} removes your prince privileges!`);
				return B.sayAtExcept(player.room, `${player.name} removes ${target.name}'s prince privileges!`, [player,target] );
			} else {
				target.setMeta('favour', 'prince');
				B.sayAt( player, `You make ${target.name} a prince!` );
				B.sayAtExcept( target, `${player.name} has made ${target.name} a prince!`, [player, target] );
				B.sayAt( target, `${player.name} has made you a prince!` );
			}
		} else if( rank === 'sire' ) {
			if( target.getMeta('favour' === 'sire' ) ) {
				target.setMeta('favour', '');
				B.sayAt(player, `You remove ${target.name}'s permission to sire a childe!`);
				B.sayAt(target, `${player.name} removes your permission to sire a childe!`);
				return B.sayAtExcept(player.room, `${player.name} removes ${target.name}'s permission to sire a childe!`, [player,target] );
			} else {
				target.setMeta('favour', 'site');
				B.sayAt( player, `You grant ${target.name} permission to sire a childe!` );
				B.sayAtExcept( target, `${player.name} has given ${target.name} permission to sire a childe!`, [player, target] );
				return B.sayAt( target, `${player.name} has granted you permission to sire a childe!` );
			}
		}
	}
};