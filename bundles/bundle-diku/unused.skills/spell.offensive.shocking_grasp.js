void spell_shocking_grasp(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  int basedmg;
  int dam;

  if (IS_ITEMAFF(victim, ITEMA_SHOCKSHIELD))
    return;

  if (!IS_NPC(victim) && IS_IMMUNE(victim, IMM_LIGHTNING) && number_percent() > 5)
    return;

  basedmg = 15 + (level / 4);
  dam = calc_spell_damage(basedmg, TRUE, FALSE, ch, victim);
  damage(ch, victim, dam, sn);

  return;
}