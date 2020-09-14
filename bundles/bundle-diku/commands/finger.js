'use strict';

const fs = require('fs-extra');
const { Broadcast: B, Logger } = require('ranvier');

module.exports = {
  usage: 'finger <player>',
  command: state => (args, player) => {

    if( !args || !args.length) {
      return B.sayAt(player, `Finger who?`);
    }

    if( !( victim = get_char_world(ch, argument) ))
    {
      /*		fOld = load_char_obj( &d, argument);
       if (fOld) victim = d.character; */
    }
    else
    {
      fPlay=TRUE;
      fOld=TRUE;
    }

    if(!fOld)
    {
      send_to_char("That person is not on Vampire Wars at the moment!\n\r",ch);
      return;
    }
    let title = player.getMeta('title');
    let description = player.getMeta('description');
    let age = player.getMeta('age');
    let createDate = player.getMeta('createDate');
    let status = player.getMeta('status');
    let emailAddress = player.getMeta('email');

    B.sayAt(player, `----------------------------------------------------`);
    B.sayAt(player, `${player.name} ${title}`);
    B.sayAt(player, `${description}`);
    B.sayAt(player, `He is ${age} years old.`);
    B.sayAt(player, `He was created on ${createDate}`);

    B.sayAt(player, ``);

    B.sayAt(player, `He is ${status}`);

    B.sayAt(player, ``);

    if(!emailAddress || !emailAddress.length) {
      B.sayAt(player, `No email address submitted.`);
    } else {
      B.sayAt(player, `Email: ${emailAddress}`);
    }
    B.sayAt(player, `----------------------------------------------------`);


    return;


  }
};