'use strict';

const { Broadcast: B } = require('ranvier');

module.exports = {
  aliases: [ 'experience' ],
  usage: 'tnl',
  command: state => (args, player) => {
    /**
    let spells = player.getMeta('spells');
    B.sayAt(player, `===================================[ SPELLS ]===================================`);
    B.sayAt(player, `Purple: ${spells.purple}  Red: ${spells.red}  Blue: ${spells.blue}  Green: ${spells.green}  Yellow: ${spells.yellow}`);
    B.sayAt(player, ``);
    */

    let weapons = player.getMeta( 'weapons' );
    B.sayAt(player, `==================================[ WEAPONS ]===================================`);
    B.sayAt(player, `Hit:   ${weapons.hit}   Slice: ${weapons.slice}   Stab:  ${weapons.stab}   Slash:  ${weapons.slash}`);
    B.sayAt(player, `Whip:  ${weapons.whip}   Claw:  ${weapons.claw}   Blast: ${weapons.blast}   Pound:  ${weapons.pound}`);
    B.sayAt(player, `Crush: ${weapons.crush}   Bite:  ${weapons.bite}   Grep:  ${weapons.grep}   Pierce: ${weapons.pierce}`);
    B.sayAt(player, `Suck:  ${weapons.suck}`);
    B.sayAt(player, ``);

    let stances = player.getMeta( 'stances' );
    B.sayAt(player, `"================================[ BASIC STANCES ]===============================`);
    B.sayAt(player, `       Bull: ${stances.bull}   Crane: ${stances.crane}   Mongoose: ${stances.mongoose}  Viper: ${stances.viper}`);
    B.sayAt(player, ``);

    B.sayAt(player, `==============================[ ADVANCED STANCES ]==============================`);
    B.sayAt(player, `       Cobra: ${stances.cobra}   Falcon: ${stances.falcon}   Grizzlie: ${stances.grizzlie}`);
    B.sayAt(player, `       Lion: ${stances.lion}   Panther: ${stances.panther}   Swallow: ${stances.swallow}`);
    return B.sayAt(player, ``);
  }
};