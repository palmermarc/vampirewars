void spell_lightning_breath(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *vch;
  CHAR_DATA *vch_next;
  char buf[MAX_STRING_LENGTH];
  int dam;
  int hpch;
  int counter = 0;

  dam = skill_table[sn].base_power;

  for (vch = ch->in_room->people; vch != NULL; vch = vch_next)
  {
    // Increased the amount of things hit to 12
    if (counter > 12)
      break;

    vch_next = vch->next_in_room;

    // don't attack an NPC if they are mounted
    if ( vch->mounted == IS_MOUNT ) {
      continue;
    }

    if (IS_NPC(ch) ? !IS_NPC(vch) : IS_NPC(vch))
    {

      hpch = UMAX(10, ch->hit);
      if (!IS_NPC(ch) && ch->max_mana >= 1000)
      {
        dam += number_range(ch->max_mana / 90, ch->max_mana / 110);

        if (!IS_NPC(ch) && ch->spl[SPELL_PURPLE] >= 200 && ch->spl[SPELL_RED] >= 200 && ch->spl[SPELL_BLUE] >= 200 && ch->spl[SPELL_GREEN] >= 200 && ch->spl[SPELL_YELLOW] >= 200)
        {
          if (number_percent() > 85)
          {
            dam += (number_range(250, 500));
            send_to_char("Your skin sparks with magical energy.\n\r", ch);
          }

          dam *= 1.25; // GS all bonus, 50% damage increase
        }

        if( ch->remortlevel > 0 )
        {
          dam *= (1.25 * ch->remortlevel);
        }
      }
    else
      dam = number_range(hpch / 16 + 1, hpch / 8);

      if (saves_spell(level, vch))
        dam /= 2;

      if (dam < 1)
        dam = 1;

      damage(ch, vch, dam, sn);

      if( number_percent() > 95 ) // You "crit" - freeze them
      {
        vch->position = POS_STUNNED;
        snprintf(buf, MAX_INPUT_LENGTH, "Your lightning breath strikes %s directly and knocks them on their ass!.\n\r", vch->short_descr);
        send_to_char(buf, ch);
      }

      if (!IS_NPC(vch) && IS_SET(vch->act, PLR_VAMPIRE) && vch->hit <= ((vch->max_hit) - dam))
      vch->hit = vch->hit + (dam / 4);

      counter++;
    }
  }

  return;
}