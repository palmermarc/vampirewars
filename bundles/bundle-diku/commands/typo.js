'use strict';

const fs = require('fs-extra');
const { Broadcast: B, Logger } = require('ranvier');

/**
 * Command to allow you to reload a command's definition from disk without restarting the server
 */
module.exports = {
  usage: 'typo <details>',
  command: state => (typo, player) => {
    let filepath = 'data/typos.json';

    // Ensure that the file exists. This will create the file if it doesn't exist
    fs.ensureFileSync(filepath);

    let typos = [];

    const contents = fs.readFileSync(fs.realpathSync(filepath)).toString('utf8');

    // Try to parse the typos and log it if the file is empty
    try {
      typos = JSON.parse(contents);
    } catch(e) {
      Logger.log(`${player.name} is submitting a typo and the file is empty.`);
    }

    if(player.role === 2 && (!typo || !typo.length)) {
      if( typos.length ) {
        B.sayAt(player, `There are ${typos.length} typos that have been submitted by players.`);
        B.sayAt(player, `--------------------------------------------------------------------`);
        B.sayAt(player, ``);
        typos.map(typo => {
          B.sayAt(player, `<b>${typo.message}</b>`)
          B.sayAt(player, B.indent(`<b>Submitted By: ${typo.submitted_by}</b>`, 2));
          B.sayAt(player, ``);
        });

        return;
      } else {
        return B.sayAt(player, `<b>No typos have been submitted yet.</b>`);
      }
    }

    if (!typo || !typo.length) {
      return B.sayAt(player, '<b>Can you provide some more information about the typo you have found?</b>');
    }

    let newTypo = {
      "submitted_by": player.name,
      "message": typo
    };

    typos.push(newTypo);

    fs.writeFileSync(filepath, JSON.stringify(typos, null, 2), 'utf8');

    B.sayAt(player, `<b>Typo submitted - thanks for keeping the game clean and error free!</b>...`);
  }
};