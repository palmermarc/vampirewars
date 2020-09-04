'use strict';

const fs = require('fs-extra');
const { Broadcast: B, Logger } = require('ranvier');

/**
 * Command to allow you to reload a command's definition from disk without restarting the server
 */
module.exports = {
  usage: 'bug <details>',
  command: state => (bug, player) => {
    let filepath = 'data/bugs.json';

    // Ensure that the file exists. This will create the file if it doesn't exist
    fs.ensureFileSync(filepath);

    let bugs = [];

    const contents = fs.readFileSync(fs.realpathSync(filepath)).toString('utf8');

    // Try to parse the bugs and log it if the file is empty
    try {
      bugs = JSON.parse(contents);
    } catch(e) {
      Logger.log(`${player.name} is submitting a bug and the file is empty.`);
    }

    if(player.role === 2 && (!bug || !bug.length)) {
      if( bugs.length ) {
        B.sayAt(player, `There are ${bugs.length} bugs that have been submitted by players.`);
        B.sayAt(player, `--------------------------------------------------------------------`);
        B.sayAt(player, ``);
        bugs.map(bug => {
          B.sayAt(player, `<b>${bug.message}</b>`)
          B.sayAt(player, B.indent(`<b>Submitted By: ${bug.submitted_by}</b>`, 2));
          B.sayAt(player, ``);
        });

        return;
      } else {
        return B.sayAt(player, `<b>No bugs have been submitted yet.</b>`);
      }
    }

    if (!bug || !bug.length) {
      return B.sayAt(player, '<b>Can you provide some more information about the bug you have found?</b>');
    }

    let newBug = {
      "submitted_by": player.name,
      "message": bug
    };

    bugs.push(newBug);

    fs.writeFileSync(filepath, JSON.stringify(bugs, null, 2), 'utf8');

    B.sayAt(player, `<b>Bug submitted - thanks for keeping the game clean and error free!</b>...`);
  }
};