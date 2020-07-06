void spell_magic_missile(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  int basedmg;
  int dam;

  basedmg = 15 + (level / 3);
  dam = calc_spell_damage(basedmg, TRUE, TRUE, ch, victim);
  damage(ch, victim, dam, sn);
  return;
}