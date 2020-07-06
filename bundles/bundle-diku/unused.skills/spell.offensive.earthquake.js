void spell_earthquake(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *vch;
  CHAR_DATA *vch_next;
  int counter = 0;

  send_to_char("The earth trembles beneath your feet!\n\r", ch);
  act("$n makes the earth tremble and shiver.", ch, NULL, NULL, TO_ROOM);

  for (vch = char_list; vch != NULL; vch = vch_next)
  {
    if (counter > 8)
      break;
    vch_next = vch->next;
    if (vch->in_room == NULL)
      continue;
    if (vch->in_room == ch->in_room)
    {
      if (vch != ch && (IS_NPC(ch) ? !IS_NPC(vch) : IS_NPC(vch)))
        damage(ch, vch, level + dice(2, 8), sn);
      counter++;
      continue;
    }

    if (vch->in_room->area == ch->in_room->area)
    send_to_char("The earth trembles and shivers.\n\r", vch);
  }

  return;
}