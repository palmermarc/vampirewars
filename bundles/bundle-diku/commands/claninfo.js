'use strict';

const { Broadcast: B } = require('ranvier');

module.exports = {
	usage: 'claninfo',
	command: (state) => (args, player) => {

		/**
		 * TODO: Find an easy way for the game to just pull this data from player files
		 */
		B.sayAt( player, "Leader of Assamite............. None." );
		B.sayAt( player, "Leader of Tremere............ None." );
		B.sayAt( player, "Leader of Tzimisce.......... None." );
		B.sayAt( player, "Leader of Ventrue............ None." );
		B.sayAt( player, "Leader of Lasombra............ None." );
		B.sayAt( player, "Leader of Toreador........... None." );
		B.sayAt( player, "If you want anything, please contact your respective Leader." );
		B.sayAt( player, "-------------------------------------" );
		/**
		 if (arg[0] == '\0') {
				send_to_char_formatted("CLAN               1   2   3   4   5   6   7 \n\r", ch);
				snprintf(buf, MAX_INPUT_LENGTH, "1 Assamite          --- %3d %3d %3d %3d %3d %3d \n\r", clan_infotable[1].pkills[2], clan_infotable[1].pkills[3], clan_infotable[1].pkills[4], clan_infotable[1].pkills[5], clan_infotable[1].pkills[6], clan_infotable[1].pkills[7]);
				send_to_char_formatted(buf, ch);
				snprintf(buf, MAX_INPUT_LENGTH, "2 Tzimisce       %3d --- %3d %3d %3d %3d %3d \n\r", clan_infotable[2].pkills[1], clan_infotable[2].pkills[3], clan_infotable[2].pkills[4], clan_infotable[2].pkills[5], clan_infotable[2].pkills[6], clan_infotable[2].pkills[7]);
				send_to_char_formatted(buf, ch);
				snprintf(buf, MAX_INPUT_LENGTH, "3 Ventrue         %3d %3d --- %3d %3d %3d %3d \n\r", clan_infotable[3].pkills[1], clan_infotable[3].pkills[2], clan_infotable[3].pkills[4], clan_infotable[3].pkills[5], clan_infotable[3].pkills[6], clan_infotable[3].pkills[7]);
				send_to_char_formatted(buf, ch);
				snprintf(buf, MAX_INPUT_LENGTH, "4 Tremere         %3d %3d %3d --- %3d %3d %3d \n\r", clan_infotable[4].pkills[1], clan_infotable[4].pkills[2], clan_infotable[4].pkills[3], clan_infotable[4].pkills[5], clan_infotable[4].pkills[6], clan_infotable[4].pkills[7]);
				send_to_char_formatted(buf, ch);
				snprintf(buf, MAX_INPUT_LENGTH, "5 Lasombra         %3d %3d %3d %3d --- %3d %3d \n\r", clan_infotable[5].pkills[1], clan_infotable[5].pkills[2], clan_infotable[5].pkills[3], clan_infotable[5].pkills[4], clan_infotable[5].pkills[6], clan_infotable[5].pkills[7]);
				send_to_char_formatted(buf, ch);
				snprintf(buf, MAX_INPUT_LENGTH, "6 Toreador        %3d %3d %3d %3d %3d --- %3d \n\r", clan_infotable[6].pkills[1], clan_infotable[6].pkills[2], clan_infotable[6].pkills[3], clan_infotable[6].pkills[4], clan_infotable[6].pkills[5], clan_infotable[6].pkills[7]);
				send_to_char_formatted(buf, ch);

			}
			if (!str_cmp(arg, "mobs"))
			{
				send_to_char_formatted("\n\r------------------------------------------\n\r", ch);
				send_to_char_formatted("CLAN	      Mobs Killed   Deaths by Mobs\n\r", ch);
				snprintf(buf, MAX_INPUT_LENGTH, "Assamite   %14ld %14d\n\r", clan_infotable[1].mkills, clan_infotable[1].mkilled);
				send_to_char_formatted(buf, ch);
				snprintf(buf, MAX_INPUT_LENGTH, "Tzimisce%14ld %14d\n\r", clan_infotable[2].mkills, clan_infotable[2].mkilled);
				send_to_char_formatted(buf, ch);
				snprintf(buf, MAX_INPUT_LENGTH, "Ventrue  %14ld %14d\n\r", clan_infotable[3].mkills, clan_infotable[3].mkilled);
				send_to_char_formatted(buf, ch);
				snprintf(buf, MAX_INPUT_LENGTH, "Tremere  %14ld %14d\n\r", clan_infotable[4].mkills, clan_infotable[4].mkilled);
				send_to_char_formatted(buf, ch);
				snprintf(buf, MAX_INPUT_LENGTH, "Lasombra  %14ld %14d\n\r", clan_infotable[5].mkills, clan_infotable[5].mkilled);
				send_to_char_formatted(buf, ch);
				snprintf(buf, MAX_INPUT_LENGTH, "Toreador %14ld %14d\n\r", clan_infotable[6].mkills, clan_infotable[6].mkilled);
				send_to_char_formatted(buf, ch);
			}
		 */
	}
};
