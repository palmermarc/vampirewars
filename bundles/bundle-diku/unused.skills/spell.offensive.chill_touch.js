void spell_chill_touch(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  int dam;
  int basedmg;
  bool saved;

  if (IS_ITEMAFF(victim, ITEMA_ICESHIELD))
    return;

  if (!IS_NPC(victim) && IS_IMMUNE(victim, IMM_COLD) && number_percent() > 5)
  {
    saved = TRUE;
  }

  basedmg = 35 + level/3;
  dam = calc_spell_damage(basedmg, TRUE, saved, ch, victim);
  damage(ch, victim, dam, sn);

  return;
}