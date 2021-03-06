void spell_acid_blast(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  int dam;
  int basedmg;
  bool saved = FALSE;

  if (IS_ITEMAFF(victim, ITEMA_ACIDSHIELD))
    return;

  if (!IS_NPC(victim) && IS_IMMUNE(victim, IMM_ACID) && number_percent() > 5)
    saved = TRUE;

  basedmg = 20 + level/3;

  dam = calc_spell_damage(basedmg, TRUE, saved, ch, victim);
  damage(ch, victim, dam, sn);
  return;
}

void spell_armor(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA af;

  if (is_affected(victim, sn))
    return;

  af.type = sn;
  if( !IS_NPC(ch))
    af.duration = 20 + level + ((ch->pcdata->perm_wis + ch->pcdata->mod_wis)/10);
else
  af.duration = 24;

  af.modifier = victim->armor / 10; // Give a 10% armor bonus
  af.location = APPLY_AC;
  af.bitvector = 0;

  affect_to_char(victim, &af);
  send_to_char("You feel someone protecting you.\n\r", victim);

  if (ch != victim)
    send_to_char("Ok.\n\r", ch);
  return;
}

void spell_bless(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA af;
  int modifier = 10;

  if (victim->position == POS_FIGHTING || is_affected(victim, sn))
    return;

  af.type = sn;
  if( !IS_NPC(ch))
    af.duration = 6 + level + ((ch->pcdata->perm_wis + ch->pcdata->mod_wis)/10);
else
  af.duration = 10;

  af.location = APPLY_hit_chance;

  if( !IS_NPC(ch))
    modifier = (level / 5) + (ch->max_mana / 500);

  af.modifier = modifier;
  af.bitvector = 0;
  affect_to_char(victim, &af);

  send_to_char("You feel righteous.\n\r", victim);

  if (ch != victim)
    send_to_char("Ok.\n\r", ch);

  return;
}


/**
 * Allow players to create their own goldfind buff. We should probably make some
 * gold find have a chance to appear on gear if it randomly upgrades (yay dynamic loot)
 */
void spell_treasurehunter(int sn, int level, CHAR_DATA *ch, void *vo)
{
  AFFECT_DATA af;

  if (is_affected(ch, sn))
  {
    send_to_char("A more powerful version of this spell already exists.\n\r", ch);
    return;
  }

  if (ch->primal < 1)
  {
    send_to_char("Tresure Hunter requires primal to cast.\n\r", ch);
    return;
  }

  af.type = sn;
  af.location = APPLY_GOLD_BOOST;
  af.duration = ch->primal * 2;
  af.modifier = ch->primal * 5;

  ch->primal = 0;
  affect_to_char(ch, &af);

  send_to_char("Your ability to seak treasures has grown exponentially.\n\r", ch);

  return;
}

void spell_blindness(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA af;

  if (IS_AFFECTED(victim, AFF_BLIND) || saves_spell(level, victim))
    return;

  if (IS_NPC(victim) && IS_SET(victim->act, ACT_IMMBLIND))
    return;

  af.type = sn;
  af.location = APPLY_hit_chance;
  af.modifier = -4;
  af.duration = 1 + level;
  af.bitvector = AFF_BLIND;
  affect_to_char(victim, &af);
  send_to_char("You are blinded!\n\r", victim);
  if (ch != victim)
    send_to_char("Ok.\n\r", ch);
  return;
}

void spell_burning_hands(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  int basedmg = 41;
  int dam;
  bool saved = FALSE;

  if (IS_ITEMAFF(victim, ITEMA_FIRESHIELD) && !IS_SET(victim->act, PLR_VAMPIRE))
    return;

  if(saves_spell(level, victim))
    saved = TRUE;

  basedmg += level/3;

  dam = calc_spell_damage(basedmg, TRUE, saved, ch, victim);
  damage(ch, victim, dam, sn);

  return;
}

void spell_call_lightning(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *vch;
  CHAR_DATA *vch_next;
  int dam;
  int hp;
  int counter = 0;

  if (!IS_OUTSIDE(ch))
  {
    send_to_char("You must be out of doors.\n\r", ch);
    return;
  }

  if (weather_info.sky < SKY_RAINING)
  {
    send_to_char("You need bad weather.\n\r", ch);
    return;
  }

  dam = dice(level / 2, 8);

  send_to_char("God's lightning strikes your foes!\n\r", ch);
  act("$n calls God's lightning to strike $s foes!",
    ch, NULL, NULL, TO_ROOM);

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
      {
        if (IS_ITEMAFF(vch, ITEMA_SHOCKSHIELD))
          continue;
        if (saves_spell(level, vch))
          dam /= 2;
        hp = vch->hit;
        damage(ch, vch, dam, sn);
        if (!IS_NPC(vch) && IS_IMMUNE(vch, IMM_LIGHTNING) && number_percent() > 5)
          vch->hit = hp;
        counter++;
      }
      continue;
    }

    if (vch->in_room->area == ch->in_room->area && IS_OUTSIDE(vch) && IS_AWAKE(vch))
    send_to_char("Lightning flashes in the sky.\n\r", vch);
  }
  return;
}

void spell_cause_light(int sn, int level, CHAR_DATA *ch, void *vo)
{
  bool saved = FALSE;
  int basedmg = 15 + (level/5);
  CHAR_DATA *victim = (CHAR_DATA *)vo;

  if(saves_spell(level, victim))
    saved = TRUE;

  int dam = calc_spell_damage(basedmg, TRUE, saved, ch, victim);

  damage(ch, victim, dam, sn);
  return;
}

void spell_cause_critical(int sn, int level, CHAR_DATA *ch, void *vo)
{
  bool saved = FALSE;
  int basedmg = 15 + (level/5);
  CHAR_DATA *victim = (CHAR_DATA *)vo;

  if(saves_spell(level, victim))
    saved = TRUE;

  int dam = calc_spell_damage(basedmg, TRUE, saved, ch, victim);

  damage(ch, victim, dam, sn);
  return;
}

void spell_cause_serious(int sn, int level, CHAR_DATA *ch, void *vo)
{
  bool saved = FALSE;
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  int basedmg = 15 + (level/5);
  int dam;

  if(saves_spell(level, victim))
    saved = TRUE;

  dam = calc_spell_damage(basedmg, TRUE, saved, ch, victim);
  damage(ch, victim, dam, sn);
  return;
}

void spell_change_sex(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA af;

  if (is_affected(victim, sn))
    return;
  af.type = sn;
  af.duration = 10 * level;
  af.location = APPLY_SEX;
  do
  {
    af.modifier = number_range(0, 2) - victim->sex;
  } while (af.modifier == 0);
  af.bitvector = 0;
  affect_to_char(victim, &af);
  send_to_char("You feel different.\n\r", victim);
  if (ch != victim)
    send_to_char("Ok.\n\r", ch);
  return;
}

void spell_charm_person(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA af;

  if (victim == ch)
  {
    send_to_char("You like yourself even better!\n\r", ch);
    return;
  }

  if (!IS_NPC(victim) && IS_IMMUNE(victim, IMM_CHARM) && number_percent() > 5)
  {
    send_to_char("You failed.\n\r", ch);
    return;
  }

  /* I don't want people charming ghosts and stuff - KaVir */
  if (IS_NPC(victim) && IS_AFFECTED(victim, AFF_ETHEREAL))
  {
    send_to_char("They are too insubstantial.\n\r", ch);
    return;
  }

  if (IS_SET(ch->in_room->room_flags, ROOM_SAFE))
  {
    send_to_char("You cannot charm someone in a safe room.\n\r", ch);
    return;
  }

  if (IS_NPC(victim) && victim->pIndexData->pShop != NULL)
  {
    send_to_char("You cannot charm this shopkeeper!\n\r", ch);
    return;
  }

  if (IS_AFFECTED(victim, AFF_CHARM) || IS_AFFECTED(ch, AFF_CHARM) || ((!IS_NPC(victim)) && ((ch->level) != (victim->level))) || ((IS_NPC(victim)) && ((victim->level) >= 100)))
    return;

  if (victim->master)
    stop_follower(victim);
  add_follower(victim, ch);
  af.type = sn;
  af.duration = number_fuzzy(level / 4);
  af.location = 0;
  af.modifier = 0;
  af.bitvector = AFF_CHARM;
  affect_to_char(victim, &af);
  act("Isn't $n just so nice?", ch, NULL, victim, TO_VICT);
  if (ch != victim)
    send_to_char("Ok.\n\r", ch);
  return;
}



void spell_colour_spray(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  int basedmg = 59 + level/3;;
  int dam;
  bool saved = FALSE;

  if (saves_spell(level, victim))
    saved = TRUE;

  dam = calc_spell_damage(basedmg, FALSE, saved, ch, victim);

  damage(ch, victim, dam, sn);
  return;
}

void spell_continual_light(int sn, int level, CHAR_DATA *ch, void *vo)
{
  OBJ_DATA *light;

  light = create_object(get_obj_index(OBJ_VNUM_LIGHT_BALL), 0);
  obj_to_room(light, ch->in_room);
  act("$n twiddles $s thumbs and $p appears.", ch, light, NULL, TO_ROOM);
  act("You twiddle your thumbs and $p appears.", ch, light, NULL, TO_CHAR);
  return;
}

void spell_control_weather(int sn, int level, CHAR_DATA *ch, void *vo)
{
  if (!str_cmp(target_name, "better"))
    weather_info.change += dice(level, 4);
  else if (!str_cmp(target_name, "worse"))
    weather_info.change -= dice(level, 4);
  else
    send_to_char("Do you want it to get better or worse?\n\r", ch);

  send_to_char("Ok.\n\r", ch);
  return;
}

void spell_create_food(int sn, int level, CHAR_DATA *ch, void *vo)
{
  OBJ_DATA *mushroom;

  mushroom = create_object(get_obj_index(OBJ_VNUM_MUSHROOM), 0);
  mushroom->value[0] = 5 + level;
  obj_to_char(mushroom, ch);
  act("$p suddenly appears in $n's hands.", ch, mushroom, NULL, TO_ROOM);
  act("$p suddenly appears in your hands.", ch, mushroom, NULL, TO_CHAR);
  return;
}

void spell_create_spring(int sn, int level, CHAR_DATA *ch, void *vo)
{
  OBJ_DATA *spring;

  if (!IS_NPC(ch) && IS_SET(ch->act, PLR_VAMPIRE))
    spring = create_object(get_obj_index(OBJ_VNUM_BLOOD_SPRING), 0);
  else
    spring = create_object(get_obj_index(OBJ_VNUM_SPRING), 0);
  spring->timer = level;
  obj_to_room(spring, ch->in_room);
  act("$p flows from the ground.", ch, spring, NULL, TO_ROOM);
  act("$p flows from the ground.", ch, spring, NULL, TO_CHAR);
  return;
}

void spell_create_water(int sn, int level, CHAR_DATA *ch, void *vo)
{
  OBJ_DATA *obj = (OBJ_DATA *)vo;
  int water;

  if (obj->item_type != ITEM_DRINK_CON)
  {
    send_to_char("It is unable to hold water.\n\r", ch);
    return;
  }

  if (obj->value[2] != LIQ_WATER && obj->value[1] != 0)
  {
    send_to_char("It contains some other liquid.\n\r", ch);
    return;
  }

  water = UMIN(
    level * (weather_info.sky >= SKY_RAINING ? 4 : 2),
    obj->value[0] - obj->value[1]);

  if (water > 0)
  {
    obj->value[2] = LIQ_WATER;
    obj->value[1] += water;
    if (!is_name("water", obj->name))
    {
      char buf[MAX_STRING_LENGTH];

      snprintf(buf, MAX_STRING_LENGTH, "%s water", obj->name);
      free_string(obj->name);
      obj->name = str_dup(buf);
    }
    act("$p is filled.", ch, obj, NULL, TO_CHAR);
  }

  return;
}

void spell_cure_blindness(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  if (!is_affected(victim, gsn_blindness))
    return;
  affect_strip(victim, gsn_blindness);
  send_to_char("Your vision returns!\n\r", victim);
  if (ch != victim)
    send_to_char("Ok.\n\r", ch);
  return;
}

void spell_cure_critical(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  int heal;

  heal = dice(3, 8) + level - 6;
  victim->hit = UMIN(victim->hit + heal, victim->max_hit);
  update_pos(victim);
  send_to_char("You feel better!\n\r", victim);
  if (ch != victim)
    send_to_char("Ok.\n\r", ch);
  return;
}

void spell_cure_light(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  int heal;

  heal = dice(1, 8) + level / 3;
  victim->hit = UMIN(victim->hit + heal, victim->max_hit);
  update_pos(victim);
  send_to_char("You feel better!\n\r", victim);
  if (ch != victim)
    send_to_char("Ok.\n\r", ch);
  return;
}

void spell_cure_poison(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  if (is_affected(victim, gsn_poison))
  {
    affect_strip(victim, gsn_poison);
    act("$N looks better.", ch, NULL, victim, TO_NOTVICT);
    send_to_char("A warm feeling runs through your body.\n\r", victim);
    send_to_char("Ok.\n\r", ch);
  }
  return;
}

void spell_cure_serious(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  int heal;

  heal = dice(2, 8) + level / 2;
  victim->hit = UMIN(victim->hit + heal, victim->max_hit);
  update_pos(victim);
  send_to_char("You feel better!\n\r", victim);
  if (ch != victim)
    send_to_char("Ok.\n\r", ch);
  return;
}

void spell_curse(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  /* Archrip - AFFECT_DATA af; */
  AFFECT_DATA af;
  if (IS_AFFECTED(victim, AFF_CURSE))
    return;
  af.type = sn;
  af.location = APPLY_hit_chance;
  af.modifier = 0;
  af.duration = 1 + level;
  af.bitvector = AFF_CURSE;
  affect_to_char(victim, &af);

  send_to_char("You feel unlucky.\n\r", victim);
  if (ch != victim)
    send_to_char("Ok.\n\r", ch);
  return;
}

void spell_detect_evil(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA af;

  if (IS_AFFECTED(victim, AFF_DETECT_EVIL))
    return;
  af.type = sn;
  af.duration = level;
  af.modifier = 0;
  af.location = APPLY_NONE;
  af.bitvector = AFF_DETECT_EVIL;
  affect_to_char(victim, &af);
  send_to_char("Your eyes tingle.\n\r", victim);
  if (ch != victim)
    send_to_char("Ok.\n\r", ch);
  return;
}

void spell_detect_hidden(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA af;

  if (IS_AFFECTED(victim, AFF_DETECT_HIDDEN))
    return;
  af.type = sn;
  af.duration = level;
  af.location = APPLY_NONE;
  af.modifier = 0;
  af.bitvector = AFF_DETECT_HIDDEN;
  affect_to_char(victim, &af);
  send_to_char("Your awareness improves.\n\r", victim);
  if (ch != victim)
    send_to_char("Ok.\n\r", ch);
  return;
}

void spell_detect_invis(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA af;

  if (IS_AFFECTED(victim, AFF_DETECT_INVIS))
    return;
  af.type = sn;
  af.duration = level;
  af.modifier = 0;
  af.location = APPLY_NONE;
  af.bitvector = AFF_DETECT_INVIS;
  affect_to_char(victim, &af);
  send_to_char("Your eyes tingle.\n\r", victim);
  if (ch != victim)
    send_to_char("Ok.\n\r", ch);
  return;
}

void spell_detect_magic(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA af;

  if (IS_AFFECTED(victim, AFF_DETECT_MAGIC))
    return;
  af.type = sn;
  af.duration = level;
  af.modifier = 0;
  af.location = APPLY_NONE;
  af.bitvector = AFF_DETECT_MAGIC;
  affect_to_char(victim, &af);
  send_to_char("Your eyes tingle.\n\r", victim);
  if (ch != victim)
    send_to_char("Ok.\n\r", ch);
  return;
}

void spell_detect_poison(int sn, int level, CHAR_DATA *ch, void *vo)
{
  OBJ_DATA *obj = (OBJ_DATA *)vo;

  if (obj->item_type == ITEM_DRINK_CON || obj->item_type == ITEM_FOOD)
  {
    if (obj->value[3] != 0)
      send_to_char("You smell poisonous fumes.\n\r", ch);
    else
      send_to_char("It looks very delicious.\n\r", ch);
  }
else
  {
    send_to_char("It doesn't look poisoned.\n\r", ch);
  }

  return;
}

void spell_dispel_evil(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  int dam;

  if (!IS_NPC(ch) && IS_EVIL(ch))
    victim = ch;

  if (IS_GOOD(victim))
  {
    act("God protects $N.", ch, NULL, victim, TO_ROOM);
    return;
  }

  if (IS_NEUTRAL(victim))
  {
    act("$N does not seem to be affected.", ch, NULL, victim, TO_CHAR);
    return;
  }

  dam = dice(level, 4);
  if (ch->max_mana > 5000)
    dam = dam + ((dam / 10) * (ch->max_mana / 1000));
  damage(ch, victim, dam, sn);
  return;
}

void spell_dispel_magic(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA *paf;
  AFFECT_DATA *paf_next;

  if (victim != ch &&
    (saves_spell(level, victim) || level < victim->level))
  {
    send_to_char("You failed.\n\r", ch);
    return;
  }

  if (!(victim->affected))
  {
    send_to_char("Nothing happens.\n\r", ch);
    return;
  }

  for (paf = victim->affected; paf != NULL; paf = paf_next)
  {
    paf_next = paf->next;
    // Do not allow gold, exp, or qp boosts to be removed
    if (paf->location == APPLY_GOLD_BOOST || paf->location == APPLY_EXP_BOOST || paf->location == APPLY_QP_BOOST) continue;

    affect_remove(victim, paf);
    //affect_modify(victim, paf, FALSE);
  }

  if (ch == victim)
  {
    act("You remove all magical affects from yourself.", ch, NULL, NULL, TO_CHAR);
    act("$n has removed all magical affects from $mself.", ch, NULL, NULL, TO_ROOM);
  }
  else
  {
    act("You remove all magical affects from $N.", ch, NULL, victim, TO_CHAR);
    act("$n has removed all magical affects from $N.", ch, NULL, victim, TO_NOTVICT);
    act("$n has removed all magical affects from you.", ch, NULL, victim, TO_VICT);
  }

  return;
}



void spell_enchant_weapon(int sn, int level, CHAR_DATA *ch, void *vo)
{
  OBJ_DATA *obj = (OBJ_DATA *)vo;
  AFFECT_DATA *paf;

  if (!IS_WEAPON(obj) || IS_SET(obj->quest, QUEST_ENCHANTED))
    return;

  if (affect_free == NULL)
  {
    paf = alloc_perm(sizeof(*paf));
  }
  else
  {
    paf = affect_free;
    affect_free = affect_free->next;
  }

  paf->type = 0;
  paf->duration = -1;
  paf->location = APPLY_hit_chance;
  paf->modifier = level / 5;
  paf->bitvector = 0;
  paf->next = obj->affected;
  obj->affected = paf;

  if (affect_free == NULL)
  {
    paf = alloc_perm(sizeof(*paf));
  }
  else
  {
    paf = affect_free;
    affect_free = affect_free->next;
  }

  paf->type = -1;
  paf->duration = -1;
  paf->location = APPLY_attack_power;
  paf->modifier = level / 10;
  paf->bitvector = 0;
  paf->next = obj->affected;
  obj->affected = paf;

  if (IS_GOOD(ch))
  {
    SET_BIT(obj->extra_flags, ITEM_ANTI_EVIL);
    SET_BIT(obj->quest, QUEST_ENCHANTED);
    act("$p glows blue.", ch, obj, NULL, TO_CHAR);
  }
  else if (IS_EVIL(ch))
  {
    SET_BIT(obj->extra_flags, ITEM_ANTI_GOOD);
    SET_BIT(obj->quest, QUEST_ENCHANTED);
    act("$p glows red.", ch, obj, NULL, TO_CHAR);
  }
  else
  {
    SET_BIT(obj->extra_flags, ITEM_ANTI_EVIL);
    SET_BIT(obj->extra_flags, ITEM_ANTI_GOOD);
    SET_BIT(obj->quest, QUEST_ENCHANTED);
    act("$p glows yellow.", ch, obj, NULL, TO_CHAR);
  }

  send_to_char("Ok.\n\r", ch);
  return;
}



void spell_fireball(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  int basedmg;
  int dam;
  bool saved = FALSE;

  if (IS_ITEMAFF(victim, ITEMA_FIRESHIELD) && !IS_SET(victim->act, PLR_VAMPIRE))
    return;

  if (!IS_NPC(victim) && IS_IMMUNE(victim, IMM_HEAT) && number_percent() > 5)
  {
    saved = TRUE;
  }

  basedmg = 15 + level/3;

  if( ch->max_mana > 1000 )
  {
    basedmg += ch->max_mana / 750;
  }

  dam = calc_spell_damage(basedmg, TRUE, saved, ch, victim);

  if( !IS_NPC(victim) && IS_SET(victim->act, PLR_VAMPIRE) && saved == FALSE)
  {
    dam *= 2;
  }

  damage(ch, victim, dam, sn);
  return;
}

void spell_flamestrike(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  int dam;
  int hp;

  if (IS_ITEMAFF(victim, ITEMA_FIRESHIELD) && !IS_SET(victim->act, PLR_VAMPIRE))
    return;
  dam = dice(6, 8);
  if (saves_spell(level, victim))
    dam /= 2;
  hp = victim->hit;
  if (!IS_NPC(victim) && IS_SET(victim->act, PLR_VAMPIRE))
  {
    damage(ch, victim, (dam * 2), sn);
    hp = ((hp - victim->hit) / 2) + victim->hit;
  }
  else
    damage(ch, victim, dam, sn);
  if (!IS_NPC(victim) && IS_IMMUNE(victim, IMM_HEAT) && number_percent() > 5)
    victim->hit = hp;
  return;
}

void spell_faerie_fire(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA af;

  if (IS_AFFECTED(victim, AFF_FAERIE_FIRE))
    return;
  af.type = sn;
  af.duration = level;
  af.location = APPLY_AC;
  af.modifier = 0 - GET_ARMOR(victim) * 0.15;
  af.bitvector = AFF_FAERIE_FIRE;
  affect_to_char(victim, &af);
  send_to_char("You are surrounded by a pink outline.\n\r", victim);
  act("$n is surrounded by a pink outline.", victim, NULL, NULL, TO_ROOM);
  return;
}

void spell_faerie_fog(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *ich;

  act("$n conjures a cloud of purple smoke.", ch, NULL, NULL, TO_ROOM);
  send_to_char("You conjure a cloud of purple smoke.\n\r", ch);

  for (ich = ch->in_room->people; ich != NULL; ich = ich->next_in_room)
  {
    if (!IS_NPC(ich) && IS_SET(ich->act, PLR_WIZINVIS))
      continue;

    if (ich == ch || saves_spell(level, ich))
      continue;

    affect_strip(ich, gsn_invis);
    affect_strip(ich, gsn_mass_invis);
    affect_strip(ich, gsn_sneak);
    REMOVE_BIT(ich->affected_by, AFF_HIDE);
    REMOVE_BIT(ich->affected_by, AFF_INVISIBLE);
    REMOVE_BIT(ich->affected_by, AFF_SNEAK);
    act("$n is revealed!", ich, NULL, NULL, TO_ROOM);
    send_to_char("You are revealed!\n\r", ich);
  }

  return;
}

void spell_fly(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA af;

  if (IS_AFFECTED(victim, AFF_FLYING))
    return;
  af.type = sn;
  af.duration = level + 3;
  af.location = 0;
  af.modifier = 0;
  af.bitvector = AFF_FLYING;
  affect_to_char(victim, &af);
  send_to_char("Your feet rise off the ground.\n\r", victim);
  act("$n's feet rise off the ground.", victim, NULL, NULL, TO_ROOM);
  return;
}

void spell_gate(int sn, int level, CHAR_DATA *ch, void *vo)
{
  char_to_room(create_mobile(get_mob_index(MOB_VNUM_VAMPIRE)),
    ch->in_room);
  return;
}

/*
* Spell for mega1.are from Glop/Erkenbrand.
*/
void spell_general_purpose(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  int dam;

  dam = number_range(25, 100);
  if (saves_spell(level, victim))
    dam /= 2;
  damage(ch, victim, dam, sn);
  return;
}

void spell_giant_strength(int sn, int level, CHAR_DATA *ch, void *vo)
{
  AFFECT_DATA af;
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  int modifier = 5;

  if (is_affected(victim, sn))
    return;

  af.type = sn;
  af.duration = level;
  af.location = APPLY_STR;

  // Make players spells cast stronger
  if( !IS_NPC(ch))
    modifier = (ch->pcdata->mod_str + ch->pcdata->perm_str)/10;

  af.modifier = modifier;

  af.bitvector = 0;
  affect_to_char(victim, &af);
  send_to_char("You feel stronger.\n\r", victim);
  if (ch != victim)
    send_to_char("Ok.\n\r", ch);
  return;
}

void spell_harm(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  int dam;

  dam = UMAX(20, victim->hit - dice(1, 4));
  if (saves_spell(level, victim))
    dam = UMIN(50, dam / 4);
  dam = UMIN(100, dam);
  damage(ch, victim, dam, sn);
  return;
}

void spell_heal(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  int healAmount = 100; // base of 100 heal

  // Define the amount healed
  if( !IS_NPC(ch))
    healAmount += (ch->max_mana/250) + ch->pcdata->perm_wis + ch->pcdata->mod_wis;

  // Heal them for the heal amount, or set them to max if that would put them over their max hp
  victim->hit = UMIN(victim->hit + healAmount, victim->max_hit);

  // Update their position in case they were morted
  update_pos(victim);

  // Output to let them know
  send_to_char("A hot feeling fills your body.\n\r", victim);

  if (ch != victim)
    send_to_char("Ok.\n\r", ch);
  if (!IS_NPC(ch) && ch != victim)
    do_humanity(ch, "");

  return;
}
/*
* Spell for mega1.are from Glop/Erkenbrand.
*/
void spell_high_explosive(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  int dam;

  dam = number_range(30, 120);
  if (saves_spell(level, victim))
    dam /= 2;
  damage(ch, victim, dam, sn);
  return;
}

void spell_identify(int sn, int level, CHAR_DATA *ch, void *vo)
{
  OBJ_DATA *obj = (OBJ_DATA *)vo;
  char buf[MAX_STRING_LENGTH];
  AFFECT_DATA *paf;
  IMBUE_DATA *id;
  int itemtype;

  snprintf(buf, MAX_STRING_LENGTH,
    "Object '%s' is type %s, extra flags %s.\n\rWeight is %ld, value is %ld.\n\r",

    obj->name,
    item_type_name(obj),
    extra_bit_name(obj->extra_flags),
    obj->weight,
    obj->cost);
  send_to_char(buf, ch);

  if(IS_WEAPON(obj))
  {
    snprintf(buf, MAX_STRING_LENGTH, "Weapon type: %s\n\r", attack_table[obj->value[3]]);
    send_to_char(buf, ch);
  }

  if (obj->questmaker != NULL && strlen(obj->questmaker) > 1 &&
    obj->questowner != NULL && strlen(obj->questowner) > 1)
  {
    snprintf(buf, MAX_STRING_LENGTH, "This object was created by %s, and is owned by %s.\n\r", obj->questmaker, obj->questowner);
    send_to_char(buf, ch);
  }
else if (obj->questmaker != NULL && strlen(obj->questmaker) > 1)
{
  snprintf(buf, MAX_STRING_LENGTH, "This object was created by %s.\n\r", obj->questmaker);
  send_to_char(buf, ch);
}
else if (obj->questowner != NULL && strlen(obj->questowner) > 1)
{
  snprintf(buf, MAX_STRING_LENGTH, "This object is owned by %s.\n\r", obj->questowner);
  send_to_char(buf, ch);
}

  if (IS_SET(obj->quest, QUEST_ENCHANTED))
    send_to_char("This item has been enchanted.\n\r", ch);
  if (IS_SET(obj->quest, QUEST_SPELLPROOF))
    send_to_char("This item is resistant to offensive spells.\n\r", ch);
  if (IS_SET(obj->quest, QUEST_INDEST))
    send_to_char("This item is indestructible.\n\r", ch);

  if ((obj->points > 0) || (obj->pIndexData->vnum == OBJ_VNUM_PROTOPLASM))
  {
    snprintf(buf, MAX_STRING_LENGTH, "Quest points used: %d/%d.\n\r", (int)obj->points,
  ((ch->status + 1) * 10) + ((obj->pIndexData->vnum == OBJ_VNUM_PROTOPLASM) ? 1250 : 750));
    send_to_char(buf, ch);
  }

  switch (obj->item_type)
  {
    case ITEM_PILL:
    case ITEM_SCROLL:
    case ITEM_POTION:
      snprintf(buf, MAX_STRING_LENGTH, "Level %d spells of:", obj->value[0]);
      send_to_char(buf, ch);

      if (obj->value[1] >= 0 && obj->value[1] < MAX_SKILL)
    {
      send_to_char(" '", ch);
      send_to_char(skill_table[obj->value[1]].name, ch);
      send_to_char("'", ch);
    }

      if (obj->value[2] >= 0 && obj->value[2] < MAX_SKILL)
    {
      send_to_char(" '", ch);
      send_to_char(skill_table[obj->value[2]].name, ch);
      send_to_char("'", ch);
    }

      if (obj->value[3] >= 0 && obj->value[3] < MAX_SKILL)
    {
      send_to_char(" '", ch);
      send_to_char(skill_table[obj->value[3]].name, ch);
      send_to_char("'", ch);
    }

      send_to_char(".\n\r", ch);
      break;

    case ITEM_QUEST:
      snprintf(buf, MAX_STRING_LENGTH, "Quest point value is %d.\n\r", obj->value[0]);
      send_to_char(buf, ch);
      break;

    case ITEM_QUESTCARD:
      snprintf(buf, MAX_STRING_LENGTH, "Quest completion reward is %d quest points.\n\r", obj->level);
      send_to_char(buf, ch);
      break;

    case ITEM_WAND:
    case ITEM_STAFF:
      snprintf(buf, MAX_STRING_LENGTH, "Has %d(%d) charges of level %d",
        obj->value[1], obj->value[2], obj->value[0]);
      send_to_char(buf, ch);

      if (obj->value[3] >= 0 && obj->value[3] < MAX_SKILL)
    {
      send_to_char(" '", ch);
      send_to_char(skill_table[obj->value[3]].name, ch);
      send_to_char("'", ch);
    }

      send_to_char(".\n\r", ch);
      break;

    case ITEM_WEAPON:
    case ITEM_WEAPON_15HAND:
    case ITEM_WEAPON_2HAND:
      snprintf(buf, MAX_STRING_LENGTH, "Damage is %d to %d (average %d).\n\r",
        obj->value[1], obj->value[2],
        (obj->value[1] + obj->value[2]) / 2);
      send_to_char(buf, ch);

      if (obj->value[0] >= 1000)
        itemtype = obj->value[0] - ((obj->value[0] / 1000) * 1000);
      else
        itemtype = obj->value[0];

      if (itemtype > 0)
      {
        if (obj->level < 10)
          snprintf(buf, MAX_STRING_LENGTH, "%s is a minor spell weapon.\n\r", capitalize(obj->short_descr));
        else if (obj->level < 20)
          snprintf(buf, MAX_STRING_LENGTH, "%s is a lesser spell weapon.\n\r", capitalize(obj->short_descr));
        else if (obj->level < 30)
          snprintf(buf, MAX_STRING_LENGTH, "%s is an average spell weapon.\n\r", capitalize(obj->short_descr));
        else if (obj->level < 40)
          snprintf(buf, MAX_STRING_LENGTH, "%s is a greater spell weapon.\n\r", capitalize(obj->short_descr));
        else if (obj->level < 50)
          snprintf(buf, MAX_STRING_LENGTH, "%s is a major spell weapon.\n\r", capitalize(obj->short_descr));
        else
          snprintf(buf, MAX_STRING_LENGTH, "%s is a supreme spell weapon.\n\r", capitalize(obj->short_descr));
        send_to_char(buf, ch);
      }

      if (itemtype == 1)
        snprintf(buf, MAX_STRING_LENGTH, "This weapon is dripping with corrosive #ga#Gc#gi#Gd#e.\n\r");
      else if (itemtype == 4)
        snprintf(buf, MAX_STRING_LENGTH, "This weapon radiates an aura of darkness.\n\r");
      else if (itemtype == 30)
        snprintf(buf, MAX_STRING_LENGTH, "This ancient relic is the bane of all evil.\n\r");
      else if (itemtype == 34)
        snprintf(buf, MAX_STRING_LENGTH, "This vampiric weapon drinks the souls of its victims.\n\r");
      else if (itemtype == 37)
        snprintf(buf, MAX_STRING_LENGTH, "This weapon has been tempered in hellfire.\n\r");
      else if (itemtype == 48)
        snprintf(buf, MAX_STRING_LENGTH, "This weapon crackles with sparks of #ll#wi#lg#wh#lt#wn#li#wn#lg#e.\n\r");
      else if (itemtype == 53)
        snprintf(buf, MAX_STRING_LENGTH, "This weapon is dripping with a dark poison.\n\r");
      else if (itemtype > MAX_SKILL)
        snprintf(buf, MAX_STRING_LENGTH, "This item is bugged...please report it.\n\r");
      else if (itemtype > 0)
        snprintf(buf, MAX_STRING_LENGTH, "This weapon has been imbued with the power of %s.\n\r", skill_table[itemtype].name);
      if (itemtype > 0)
        send_to_char(buf, ch);

      if (obj->value[0] >= 1000)
        itemtype = obj->value[0] / 1000;
      else
        break;

      if (itemtype == 4)
        snprintf(buf, MAX_STRING_LENGTH, "This object radiates an aura of darkness.\n\r");
      else if (itemtype == 27 || itemtype == 2)
        snprintf(buf, MAX_STRING_LENGTH, "This item allows the wearer to see invisible things.\n\r");
      else if (itemtype == 39 || itemtype == 3)
        snprintf(buf, MAX_STRING_LENGTH, "This object grants the power of flight.\n\r");
      else if (itemtype == 45 || itemtype == 1)
        snprintf(buf, MAX_STRING_LENGTH, "This item allows the wearer to see in the dark.\n\r");
      else if (itemtype == 46 || itemtype == 5)
        snprintf(buf, MAX_STRING_LENGTH, "This object renders the wearer invisible to the human eye.\n\r");
      else if (itemtype == 52 || itemtype == 6)
        snprintf(buf, MAX_STRING_LENGTH, "This object allows the wearer to walk through solid doors.\n\r");
      else if (itemtype == 54 || itemtype == 7)
        snprintf(buf, MAX_STRING_LENGTH, "This holy relic protects the wearer from evil.\n\r");
      else if (itemtype == 57 || itemtype == 8)
        snprintf(buf, MAX_STRING_LENGTH, "This ancient relic protects the wearer in combat.\n\r");
      else if (itemtype == 9)
        snprintf(buf, MAX_STRING_LENGTH, "This crafty item allows the wearer to walk in complete silence.\n\r");
      else if (itemtype == 10)
        snprintf(buf, MAX_STRING_LENGTH, "This powerful item surrounds its wearer with a shield of #ll#wi#lg#wh#lt#wn#li#wn#lg#e.\n\r");
      else if (itemtype == 11)
        snprintf(buf, MAX_STRING_LENGTH, "This powerful item surrounds its wearer with a shield of #rf#Ri#rr#Re#e.\n\r");
      else if (itemtype == 12)
        snprintf(buf, MAX_STRING_LENGTH, "This powerful item surrounds its wearer with a shield of #ci#Cc#ce#e.\n\r");
      else if (itemtype == 13)
        snprintf(buf, MAX_STRING_LENGTH, "This powerful item surrounds its wearer with a shield of #ga#Gc#gi#Gd#e.\n\r");
      else
        snprintf(buf, MAX_STRING_LENGTH, "This item is bugged...please report it.\n\r");
      if (itemtype > 0)
        send_to_char(buf, ch);
      break;

    case ITEM_ACCESSORY:
    case ITEM_LIGHT_ARMOR:
    case ITEM_MEDIUM_ARMOR:
    case ITEM_HEAVY_ARMOR:
      snprintf(buf, MAX_STRING_LENGTH, "Armor class is %d.\n\r", obj->value[0]);
      send_to_char(buf, ch);
      if (obj->value[3] < 1)
        break;
      if (obj->value[3] == 4)
        snprintf(buf, MAX_STRING_LENGTH, "This object radiates an aura of darkness.\n\r");
      else if (obj->value[3] == 27 || obj->value[3] == 2)
      snprintf(buf, MAX_STRING_LENGTH, "This item allows the wearer to see invisible things.\n\r");
    else if (obj->value[3] == 39 || obj->value[3] == 3)
      snprintf(buf, MAX_STRING_LENGTH, "This object grants the power of flight.\n\r");
    else if (obj->value[3] == 45 || obj->value[3] == 1)
      snprintf(buf, MAX_STRING_LENGTH, "This item allows the wearer to see in the dark.\n\r");
    else if (obj->value[3] == 46 || obj->value[3] == 5)
      snprintf(buf, MAX_STRING_LENGTH, "This object renders the wearer invisible to the human eye.\n\r");
    else if (obj->value[3] == 52 || obj->value[3] == 6)
      snprintf(buf, MAX_STRING_LENGTH, "This object allows the wearer to walk through solid doors.\n\r");
    else if (obj->value[3] == 54 || obj->value[3] == 7)
      snprintf(buf, MAX_STRING_LENGTH, "This holy relic protects the wearer from evil.\n\r");
    else if (obj->value[3] == 57 || obj->value[3] == 8)
      snprintf(buf, MAX_STRING_LENGTH, "This ancient relic protects the wearer in combat.\n\r");
    else if (obj->value[3] == 9)
      snprintf(buf, MAX_STRING_LENGTH, "This crafty item allows the wearer to walk in complete silence.\n\r");
    else if (obj->value[3] == 10)
      snprintf(buf, MAX_STRING_LENGTH, "This powerful item surrounds its wearer with a shield of #ll#wi#lg#wh#lt#wn#li#wn#lg#e.\n\r");
    else if (obj->value[3] == 11)
      snprintf(buf, MAX_STRING_LENGTH, "This powerful item surrounds its wearer with a shield of #rf#Ri#rr#Re#e.\n\r");
    else if (obj->value[3] == 12)
      snprintf(buf, MAX_STRING_LENGTH, "This powerful item surrounds its wearer with a shield of #ci#Cc#ce#e.\n\r");
    else if (obj->value[3] == 13)
      snprintf(buf, MAX_STRING_LENGTH, "This powerful item surrounds its wearer with a shield of #ga#Gc#gi#Gd#e.\n\r");
    else
      snprintf(buf, MAX_STRING_LENGTH, "This item is bugged...please report it.\n\r");
      if (obj->value[3] > 0)
        send_to_char(buf, ch);

      // Look through the item's imbues and tell them what spell is on it
      if( obj->imbue != NULL)
      {
        IMBUE_DATA * imbuespell;
        for( imbuespell = obj->imbue; imbuespell != NULL; imbuespell = imbuespell->next )
        {
          if (imbuespell->affect_number == 4)
            snprintf(buf, MAX_STRING_LENGTH, "This object radiates an aura of darkness.\n\r");
          else if (imbuespell->affect_number == 2)
            snprintf(buf, MAX_STRING_LENGTH, "This item allows the wearer to see invisible things.\n\r");
          else if (imbuespell->affect_number == 3)
            snprintf(buf, MAX_STRING_LENGTH, "This object grants the power of flight.\n\r");
          else if ( imbuespell->affect_number == 1)
            snprintf(buf, MAX_STRING_LENGTH, "This item allows the wearer to see in the dark.\n\r");
          else if (imbuespell->affect_number == 5)
            snprintf(buf, MAX_STRING_LENGTH, "This object renders the wearer invisible to the human eye.\n\r");
          else if (imbuespell->affect_number == 6)
            snprintf(buf, MAX_STRING_LENGTH, "This object allows the wearer to walk through solid doors.\n\r");
          else if (imbuespell->affect_number == 7)
            snprintf(buf, MAX_STRING_LENGTH, "This holy relic protects the wearer from evil.\n\r");
          else if (imbuespell->affect_number == 8)
            snprintf(buf, MAX_STRING_LENGTH, "This ancient relic protects the wearer in combat.\n\r");
          else if (imbuespell->affect_number == 9)
            snprintf(buf, MAX_STRING_LENGTH, "This crafty item allows the wearer to walk in complete silence.\n\r");
          else if (imbuespell->affect_number == 10)
            snprintf(buf, MAX_STRING_LENGTH, "This powerful item surrounds its wearer with a shield of #ll#wi#lg#wh#lt#wn#li#wn#lg#e.\n\r");
          else if (imbuespell->affect_number == 11)
            snprintf(buf, MAX_STRING_LENGTH, "This powerful item surrounds its wearer with a shield of #rf#Ri#rr#Re#e.\n\r");
          else if (imbuespell->affect_number == 12)
            snprintf(buf, MAX_STRING_LENGTH, "This powerful item surrounds its wearer with a shield of #ci#Cc#ce#e.\n\r");
          else if (imbuespell->affect_number == 13)
            snprintf(buf, MAX_STRING_LENGTH, "This powerful item surrounds its wearer with a shield of #ga#Gc#gi#Gd#e.\n\r");
          else
            snprintf(buf, MAX_STRING_LENGTH, "This item is bugged...please report it.\n\r");

          send_to_char(buf, ch);
        }
      }
      break;
  }

  /*
	for (paf = obj->pIndexData->affected; paf != NULL; paf = paf->next)
	{
		if (paf->location != APPLY_NONE && paf->modifier != 0)
		{
			snprintf(buf, MAX_STRING_LENGTH, "Affects %s by %d.\n\r",
					 affect_loc_name(paf->location), paf->modifier);
			send_to_char(buf, ch);
		}
	}
	*/

  for (paf = obj->affected; paf != NULL; paf = paf->next)
  {
    if (paf->location != APPLY_NONE && paf->modifier != 0)
    {
      snprintf(buf, MAX_STRING_LENGTH, "Affects %s by %d.\n\r",
        affect_loc_name(paf->location), paf->modifier);
      send_to_char(buf, ch);
    }
  }

  for (id = obj->imbue; id != NULL; id = id->next)
  {
    snprintf(buf, MAX_STRING_LENGTH, "Imbue Spell: %s  Type: %s.\n\r",
      id->name, id->item_type);
    send_to_char(buf, ch);
  }

  return;
}

void spell_infravision(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA af;

  if (IS_AFFECTED(victim, AFF_INFRARED))
    return;
  act("$n's eyes glow red.\n\r", ch, NULL, NULL, TO_ROOM);
  af.type = sn;
  af.duration = 2 * level;
  af.location = APPLY_NONE;
  af.modifier = 0;
  af.bitvector = AFF_INFRARED;
  affect_to_char(victim, &af);
  send_to_char("Your eyes glow red.\n\r", victim);
  if (ch != victim)
    send_to_char("Ok.\n\r", ch);
  return;
}

void spell_invis(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA af;

  if (IS_AFFECTED(victim, AFF_INVISIBLE))
    return;

  act("$n fades out of existence.", victim, NULL, NULL, TO_ROOM);
  af.type = sn;
  af.duration = 24;
  af.location = APPLY_NONE;
  af.modifier = 0;
  af.bitvector = AFF_INVISIBLE;
  affect_to_char(victim, &af);
  send_to_char("You fade out of existence.\n\r", victim);
  if (ch != victim)
    send_to_char("Ok.\n\r", ch);
  return;
}

void spell_know_alignment(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  char *msg;
  int ap;

  ap = victim->alignment;

  if (ap > 700)
    msg = "$N has an aura as white as the driven snow.";
  else if (ap > 350)
    msg = "$N is of excellent moral character.";
  else if (ap > 100)
    msg = "$N is often kind and thoughtful.";
  else if (ap > -100)
    msg = "$N doesn't have a firm moral commitment.";
  else if (ap > -350)
    msg = "$N lies to $S friends.";
  else if (ap > -700)
    msg = "$N's slash DISEMBOWELS you!";
  else
    msg = "I'd rather just not say anything at all about $N.";

  act(msg, ch, NULL, victim, TO_CHAR);
  return;
}



void spell_locate_object(int sn, int level, CHAR_DATA *ch, void *vo)
{
  char buf[MAX_INPUT_LENGTH];
  OBJ_DATA *obj;
  OBJ_DATA *in_obj;
  bool found;
  int count = 0;

  count = 0;

  found = FALSE;
  for (obj = object_list; obj != NULL; obj = obj->next)
  {
    if (count > 75)
      break;
    if (!can_see_obj(ch, obj) || !is_name(target_name, obj->name))
      continue;
    found = TRUE;

    for (in_obj = obj; in_obj->in_obj != NULL; in_obj = in_obj->in_obj)
      ;

    if (in_obj->carried_by != NULL)
    {
      snprintf(buf, MAX_INPUT_LENGTH, "%s carried by %s.\n\r",
        obj->short_descr, PERS(in_obj->carried_by, ch));
      count++;
    }
    else
    {
      snprintf(buf, MAX_INPUT_LENGTH, "%s in %s.\n\r",
        obj->short_descr, in_obj->in_room == NULL ? "somewhere" : in_obj->in_room->name);
      count++;
    }

    if (strlen(buf) > MAX_STRING_LENGTH)
      return;
    buf[0] = UPPER(buf[0]);
    send_to_char(buf, ch);
  }

  if (!found)
    send_to_char("Nothing like that in hell, earth, or heaven.\n\r", ch);

  return;
}



void spell_mass_invis(int sn, int level, CHAR_DATA *ch, void *vo)
{
  AFFECT_DATA af;
  CHAR_DATA *gch;

  for (gch = ch->in_room->people; gch != NULL; gch = gch->next_in_room)
  {
    if (!is_same_group(gch, ch) || IS_AFFECTED(gch, AFF_INVISIBLE))
      continue;
    act("$n slowly fades out of existence.", gch, NULL, NULL, TO_ROOM);
    send_to_char("You slowly fade out of existence.\n\r", gch);
    af.type = sn;
    af.duration = 24;
    af.location = APPLY_NONE;
    af.modifier = 0;
    af.bitvector = AFF_INVISIBLE;
    affect_to_char(gch, &af);
  }
  send_to_char("Ok.\n\r", ch);

  return;
}

void spell_null(int sn, int level, CHAR_DATA *ch, void *vo)
{
  send_to_char("That's not a spell!\n\r", ch);
  return;
}

void spell_pass_door(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA af;

  if (IS_AFFECTED(victim, AFF_PASS_DOOR))
    return;
  af.type = sn;
  af.duration = number_fuzzy(level / 4);
  af.location = APPLY_NONE;
  af.modifier = 0;
  af.bitvector = AFF_PASS_DOOR;
  affect_to_char(victim, &af);
  act("$n turns translucent.", victim, NULL, NULL, TO_ROOM);
  send_to_char("You turn translucent.\n\r", victim);
  return;
}

void spell_poison(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA af;
  char buf[MAX_INPUT_LENGTH];

  /* Ghosts cannot be poisoned - KaVir */
  if (IS_NPC(victim) && IS_AFFECTED(victim, AFF_ETHEREAL))
    return;

  if (saves_spell(level, victim))
    return;
  af.type = sn;
  af.duration = level;
  af.location = APPLY_STR;

  if(IS_NPC(victim))
  {
    if (ch->max_mana > 5000)
      af.modifier = 0 - (ch->max_mana / 2000);
    else
      af.modifier = -2;
  }
  else
  {
    if (ch->max_mana > 5000)
      af.modifier = 0 - (victim->pcdata->mod_str/10) - (ch->max_mana / 2000);
    else
      af.modifier = 0 - victim->pcdata->mod_str/10;
  }


  af.bitvector = AFF_POISON;
  affect_join(victim, &af);
  send_to_char("You feel very sick.\n\r", victim);
  if (ch == victim)
    return;
  if (!IS_NPC(victim))
    snprintf(buf, MAX_INPUT_LENGTH, "%s looks very sick as your poison takes affect.\n\r", victim->name);
  else
    snprintf(buf, MAX_INPUT_LENGTH, "%s looks very sick as your poison takes affect.\n\r", victim->short_descr);
  send_to_char(buf, ch);
  return;
}

void spell_scorpions_touch(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA af;
  char buf[MAX_INPUT_LENGTH];

  /* Ghosts cannot be poisoned - KaVir */
  if (IS_NPC(victim) && IS_AFFECTED(victim, AFF_ETHEREAL))
    return;

  af.type = sn;
  af.duration = level;
  af.location = APPLY_hit_chance;
  if (ch->vampgen > victim->vampgen)
  af.modifier = -3; // Bonus for being bigger...
else
  af.modifier = -2;
  affect_join(victim, &af);

  af.type = sn;
  af.duration = level;
  af.location = APPLY_attack_power;
  if (ch->vampgen > victim->vampgen)
  af.modifier = -3; // Bonus for being bigger...
else
  af.modifier = -2;
  affect_join(victim, &af);

  send_to_char("You are infected with Scorpion's Touch.\n\r", victim);

  if (ch == victim)
    return;
  if (!IS_NPC(victim))
    snprintf(buf, MAX_INPUT_LENGTH, "%s grows weaker as your poison takes effect.\n\r", victim->name);
  else
    snprintf(buf, MAX_INPUT_LENGTH, "%s grows weaker as your poison takes effect.\n\r", victim->short_descr);
  send_to_char(buf, ch);
  return;
}

void spell_baals_caress(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  int dam;

  dam = victim->max_hit/1000;
  damage(ch, victim, dam, sn);
  return;
}

void spell_protection(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA af;

  if (IS_AFFECTED(victim, AFF_PROTECT))
    return;
  af.type = sn;
  af.duration = 24;
  af.location = APPLY_NONE;
  af.modifier = 0;
  af.bitvector = AFF_PROTECT;
  affect_to_char(victim, &af);
  send_to_char("You feel protected.\n\r", victim);
  if (ch != victim)
    send_to_char("Ok.\n\r", ch);
  return;
}

void spell_refresh(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  int modifier = 50;

  if(ch == victim && !IS_NPC(victim))
    modifier = (victim->max_move/10) + victim->pcdata->perm_wis + victim->pcdata->mod_wis;

  victim->move = UMIN(victim->move + modifier, victim->max_move);
  send_to_char("You feel less tired.\n\r", victim);
  if (ch != victim)
    send_to_char("Ok.\n\r", ch);
  return;
}

void spell_remove_curse(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim;
  OBJ_DATA *obj;
  char arg[MAX_INPUT_LENGTH];

  one_argument(target_name, arg, MAX_INPUT_LENGTH);

  if (arg[0] == '\0')
  {
    send_to_char("Remove curse on what?\n\r", ch);
    return;
  }

  if ((victim = get_char_world(ch, target_name)) != NULL)
  {
    if (is_affected(victim, gsn_curse))
    {
      affect_strip(victim, gsn_curse);
      send_to_char("You feel better.\n\r", victim);
      if (ch != victim)
        send_to_char("Ok.\n\r", ch);
    }
    return;
  }
  if ((obj = get_obj_carry(ch, arg)) != NULL)
  {
    if (IS_SET(obj->extra_flags, ITEM_NOREMOVE))
    {
      REMOVE_BIT(obj->extra_flags, ITEM_NOREMOVE);
      act("$p flickers with energy.", ch, obj, NULL, TO_CHAR);
    }

    if (IS_SET(obj->extra_flags, ITEM_NODROP))
    {
      REMOVE_BIT(obj->extra_flags, ITEM_NODROP);
      act("$p flickers with energy.", ch, obj, NULL, TO_CHAR);
    }
    return;
  }
  send_to_char("No such creature or object to remove curse on.\n\r", ch);
  return;
}

void spell_sanctuary(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA af;

  if (IS_AFFECTED(victim, AFF_SANCTUARY))
    return;
  af.type = sn;
  af.duration = number_fuzzy(level / 8);
  af.location = APPLY_NONE;
  af.modifier = 0;
  af.bitvector = AFF_SANCTUARY;
  affect_to_char(victim, &af);
  act("$n is surrounded by a white aura.", victim, NULL, NULL, TO_ROOM);
  send_to_char("You are surrounded by a white aura.\n\r", victim);
  return;
}

void spell_shield(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA af;

  if (is_affected(victim, sn))
    return;
  af.type = sn;
  af.duration = 8 + level;
  af.location = APPLY_AC;
  af.modifier = ch->armor/8;
  af.bitvector = 0;
  affect_to_char(victim, &af);
  act("$n is surrounded by a force shield.", victim, NULL, NULL, TO_ROOM);
  send_to_char("You are surrounded by a force shield.\n\r", victim);
  return;
}



void spell_sleep(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA af;

  if (IS_AFFECTED(victim, AFF_SLEEP) || level < victim->level || (!IS_NPC(victim) && IS_IMMUNE(victim, IMM_SLEEP) && number_percent() > 5) || (IS_NPC(victim) && IS_AFFECTED(victim, AFF_ETHEREAL)) || saves_spell(level, victim))
  return;

  af.type = sn;
  af.duration = 4 + level;
  af.location = APPLY_NONE;
  af.modifier = 0;
  af.bitvector = AFF_SLEEP;
  affect_join(victim, &af);

  if (IS_AWAKE(victim))
  {
    send_to_char("You feel very sleepy ..... zzzzzz.\n\r", victim);
    act("$n goes to sleep.", victim, NULL, NULL, TO_ROOM);
    victim->position = POS_SLEEPING;
  }

  return;
}

void spell_stone_skin(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA af;

  if (is_affected(ch, sn))
    return;
  af.type = sn;
  af.duration = level;
  af.location = APPLY_AC;
  af.modifier = ch->armor/10;
  af.bitvector = 0;
  affect_to_char(victim, &af);
  act("$n's skin turns to stone.", victim, NULL, NULL, TO_ROOM);
  send_to_char("Your skin turns to stone.\n\r", victim);
  return;
}

void spell_summon(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim;
  CHAR_DATA *mount;

  if ((victim = get_char_world(ch, target_name)) == NULL)
  {
    send_to_char("You failed.\n\r", ch);
    return;
  }

  if (IS_NPC(victim))
  {
    /* summoning a mob is 1/4 of their max mana */
    if (ch->mana < ch->max_mana / 4)
    {
      ch->mana += 50;
      send_to_char("You don't have enough mana.\n\r", ch);
      return;
    }
    ch->mana -= ch->max_mana / 4;
  }

  if (victim == ch || victim->in_room == NULL || IS_SET(victim->in_room->room_flags, ROOM_NO_RECALL) || victim->level >= level + 2 || victim->fighting != NULL || victim->in_room->area != ch->in_room->area || IS_SET(victim->in_room->room_flags, ROOM_NO_SUMMON) || (!IS_NPC(victim) && !IS_IMMUNE(victim, IMM_SUMMON) && number_percent() > 5) || IS_AFFECTED(victim, AFF_ETHEREAL))
  {
    send_to_char("You failed.\n\r", ch);
    return;
  }

  act("$n disappears suddenly.", victim, NULL, NULL, TO_ROOM);
  char_from_room(victim);
  char_to_room(victim, ch->in_room);
  act("$n arrives suddenly.", victim, NULL, NULL, TO_ROOM);
  act("$N has summoned you!", victim, NULL, ch, TO_CHAR);
  do_look(victim, "auto");
  if ((mount = victim->mount) == NULL)
    return;
  char_from_room(mount);
  char_to_room(mount, get_room_index(victim->in_room->vnum));
  do_look(mount, "auto");
  return;
}

void spell_teleport(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = ch;
  CHAR_DATA *mount;
  ROOM_INDEX_DATA *pRoomIndex;
  int to_room;
  int xcount = 0;
  bool global_jump;

  if ((victim->in_room == NULL) || IS_AFFECTED(ch, AFF_CURSE) || IS_SET(victim->in_room->room_flags, ROOM_NO_RECALL) || (!IS_NPC(ch) && victim->fighting != NULL) || (!IS_NPC(victim) && !IS_IMMUNE(victim, IMM_SUMMON) && number_percent() > 5) || (victim != ch && (saves_spell(level, victim) || saves_spell(level, victim))))
  {
    send_to_char("You failed.\n\r", ch);
    return;
  }

  global_jump = (ch->spl[SPELL_PURPLE] >= 200 && ch->spl[SPELL_RED] >= 200 && ch->spl[SPELL_BLUE] >= 200 && ch->spl[SPELL_GREEN] >= 200 && ch->spl[SPELL_YELLOW] >= 200 && strcmp(target_name, "local"))
    ? TRUE
    : FALSE;

  for (;;)
  {
    xcount = xcount + 1;
    to_room = number_range(0, 65535);
    pRoomIndex = get_room_index(to_room);
    if (pRoomIndex != NULL)
    {
      if (!IS_SET(pRoomIndex->room_flags, ROOM_PRIVATE) && !IS_SET(pRoomIndex->room_flags, ROOM_SOLITARY) && !(IS_AFFECTED(victim, AFF_SHADOWPLANE) && IS_SET(pRoomIndex->room_flags, ROOM_NO_SHADOWPLANE)) && !IS_SET(pRoomIndex->room_flags, ROOM_NO_TELEPORT) && to_room != 30008 && to_room != 30002 && ((victim->in_room->area_number == pRoomIndex->area_number) || global_jump))
      {
        break;
      }
    }
    if (xcount > 3000)
    {
      send_to_char("You failed to find a site to teleport to.\n\r", ch);
      return;
    }
  }

  act("$n slowly fades out of existence.", victim, NULL, NULL, TO_ROOM);
  char_from_room(victim);
  char_to_room(victim, pRoomIndex);
  act("$n slowly fades into existence.", victim, NULL, NULL, TO_ROOM);
  do_look(victim, "auto");
  if ((mount = ch->mount) == NULL)
    return;
  char_from_room(mount);
  char_to_room(mount, get_room_index(ch->in_room->vnum));
  do_look(mount, "auto");
  return;
}

void spell_ventriloquate(int sn, int level, CHAR_DATA *ch, void *vo)
{
  char buf1[MAX_STRING_LENGTH];
  char buf2[MAX_STRING_LENGTH];
  char speaker[MAX_INPUT_LENGTH];
  CHAR_DATA *vch;

  target_name = one_argument(target_name, speaker, MAX_INPUT_LENGTH);

  snprintf(buf1, MAX_STRING_LENGTH, "%s says '%s'.\n\r", speaker, target_name);
  snprintf(buf2, MAX_STRING_LENGTH, "Someone makes %s say '%s'.\n\r", speaker, target_name);
  buf1[0] = UPPER(buf1[0]);

  for (vch = ch->in_room->people; vch != NULL; vch = vch->next_in_room)
  {
    if (!is_name(speaker, vch->name))
      send_to_char(saves_spell(level, vch) ? buf2 : buf1, vch);
  }

  return;
}

void spell_weaken(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA af;

  if(IS_NPC(ch))
  {
    // Mobs can't cast this spell
    return;
  }

  if (is_affected(victim, sn) || saves_spell(level, victim))
    return;

  af.type = sn;
  af.duration = level / 2;
  af.location = APPLY_STR;
  if(!IS_NPC(victim))
  {
    af.modifier = victim->pcdata->perm_str/2;
  }
  else
  {
    // Lowers the mobs strength by half of the players strength instead
    af.modifier = ch->pcdata->perm_str/2;
  }

  af.bitvector = 0;
  affect_to_char(victim, &af);
  send_to_char("You feel weaker.\n\r", victim);
  if (ch != victim)
    send_to_char("Ok.\n\r", ch);
  return;
}

/*
* This is for muds that _want_ scrolls of recall.
* Ick.
*/
void spell_word_of_recall(int sn, int level, CHAR_DATA *ch, void *vo)
{
  do_recall((CHAR_DATA *)vo, "");
  return;
}

/*
* NPC spells.
*/






/* Extra spells written by KaVir. */
void spell_guardian(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim;
  AFFECT_DATA af;

  victim = create_mobile(get_mob_index(MOB_VNUM_GUARDIAN));
  victim->level = 5;
  victim->hit = 20 * level;
  victim->max_hit = 20 * level;
  victim->hit_chance = level;
  victim->attack_power = level;
  victim->armor = 100 - (level * 7);

  send_to_char("Ok.\n\r", ch);
  do_say(ch, "Come forth, creature of darkness, and do my bidding!");
  send_to_char("A demon bursts from the ground and bows before you.\n\r", ch);
  act("$N bursts from the ground and bows before $n.", ch, NULL, victim, TO_ROOM);
  char_to_room(victim, ch->in_room);

  add_follower(victim, ch);
  af.type = sn;
  af.duration = 666;
  af.location = APPLY_NONE;
  af.modifier = 0;
  af.bitvector = AFF_CHARM;
  affect_to_char(victim, &af);
  return;
}

void spell_soulblade(int sn, int level, CHAR_DATA *ch, void *vo)
{
  OBJ_DATA *obj;

  char arg[MAX_INPUT_LENGTH];
  char buf[MAX_INPUT_LENGTH];
  obj = create_object(get_obj_index(OBJ_VNUM_SOULBLADE), 0);

  one_argument( (char *) vo, arg, MAX_INPUT_LENGTH);

  /* First we name the weapon */
  free_string(obj->name);
  snprintf(buf, MAX_INPUT_LENGTH, "%s soul blade", ch->name);
  obj->name = str_dup(buf);
  free_string(obj->short_descr);
  snprintf(buf, MAX_INPUT_LENGTH, "%s's soul blade", ch->name);
  obj->short_descr = str_dup(buf);
  free_string(obj->description);
  snprintf(buf, MAX_INPUT_LENGTH, "%s's soul blade is lying here.", ch->name);
  obj->description = str_dup(buf);

  obj->level = level;
  obj->value[0] = 13034;
  obj->value[1] = 10;
  obj->value[2] = 20;

  // hit
  if( !str_cmp( arg, "knuckles" ) ) {
    snprintf(buf, MAX_INPUT_LENGTH, "%s soul knuckles", ch->name);
    obj->name = str_dup(buf);
    free_string(obj->short_descr);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul knuckles", ch->name);
    obj->short_descr = str_dup(buf);
    free_string(obj->description);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul knuckles is lying here.", ch->name);
    obj->description = str_dup(buf);
    obj->value[3] = 1;
  }

  //slice
  if( !str_cmp( arg, "sword" ) ) {
    snprintf(buf, MAX_INPUT_LENGTH, "%s soul sword", ch->name);
    obj->name = str_dup(buf);
    free_string(obj->short_descr);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul sword", ch->name);
    obj->short_descr = str_dup(buf);
    free_string(obj->description);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul sword is lying here.", ch->name);
    obj->description = str_dup(buf);
    obj->value[3] = 1;
  }

  // stab
  if( !str_cmp( arg, "pike" ) ) {
    snprintf(buf, MAX_INPUT_LENGTH, "%s soul pike", ch->name);
    obj->name = str_dup(buf);
    free_string(obj->short_descr);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul pike", ch->name);
    obj->short_descr = str_dup(buf);
    free_string(obj->description);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul pike is lying here.", ch->name);
    obj->description = str_dup(buf);
    obj->value[3] = 2;
  }

  // slash
  if( !str_cmp( arg, "scimitar" ) ) {
    snprintf(buf, MAX_INPUT_LENGTH, "%s soul scimitar", ch->name);
    obj->name = str_dup(buf);
    free_string(obj->short_descr);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul scimitar", ch->name);
    obj->short_descr = str_dup(buf);
    free_string(obj->description);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul scimitar is lying here.", ch->name);
    obj->description = str_dup(buf);
    obj->value[3] = 3;
  }

  if( !str_cmp( arg, "whip" ) ) {
    snprintf(buf, MAX_INPUT_LENGTH, "%s soul whip", ch->name);
    obj->name = str_dup(buf);
    free_string(obj->short_descr);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul whip", ch->name);
    obj->short_descr = str_dup(buf);
    free_string(obj->description);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul whip is lying here.", ch->name);
    obj->description = str_dup(buf);
    obj->value[3] = 4;
  }

  // claw
  if( !str_cmp( arg, "claw" ) ) {
    snprintf(buf, MAX_INPUT_LENGTH, "%s soul claw", ch->name);
    obj->name = str_dup(buf);
    free_string(obj->short_descr);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul claw", ch->name);
    obj->short_descr = str_dup(buf);
    free_string(obj->description);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul claw is lying here.", ch->name);
    obj->description = str_dup(buf);
    obj->value[3] = 5;
  }

  // blast
  if( !str_cmp( arg, "blaster" ) ) {
    snprintf(buf, MAX_INPUT_LENGTH, "%s soul blaster", ch->name);
    obj->name = str_dup(buf);
    free_string(obj->short_descr);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul blaster", ch->name);
    obj->short_descr = str_dup(buf);
    free_string(obj->description);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul blaster is lying here.", ch->name);
    obj->description = str_dup(buf);
    obj->value[3] = 6;
  }

  // pound
  if( !str_cmp( arg, "mace" ) ) {
    snprintf(buf, MAX_INPUT_LENGTH, "%s soul mace", ch->name);
    obj->name = str_dup(buf);
    free_string(obj->short_descr);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul mace", ch->name);
    obj->short_descr = str_dup(buf);
    free_string(obj->description);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul mace is lying here.", ch->name);
    obj->description = str_dup(buf);
    obj->value[3] = 7;
  }

  // crush
  if( !str_cmp( arg, "hammer" ) ) {
    snprintf(buf, MAX_INPUT_LENGTH, "%s soul hammer", ch->name);
    obj->name = str_dup(buf);
    free_string(obj->short_descr);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul hammer", ch->name);
    obj->short_descr = str_dup(buf);
    free_string(obj->description);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul hammer is lying here.", ch->name);
    obj->description = str_dup(buf);
    obj->value[3] = 8;
  }

  // grep
  if( !str_cmp( arg, "net" ) ) {
    snprintf(buf, MAX_INPUT_LENGTH, "%s soul net", ch->name);
    obj->name = str_dup(buf);
    free_string(obj->short_descr);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul net", ch->name);
    obj->short_descr = str_dup(buf);
    free_string(obj->description);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul net is lying here.", ch->name);
    obj->description = str_dup(buf);
    obj->value[3] = 9;
  }

  // bite
  if( !str_cmp( arg, "fang" ) ) {
    snprintf(buf, MAX_INPUT_LENGTH, "%s soul fang", ch->name);
    obj->name = str_dup(buf);
    free_string(obj->short_descr);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul fang", ch->name);
    obj->short_descr = str_dup(buf);
    free_string(obj->description);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul fang is lying here.", ch->name);
    obj->description = str_dup(buf);
    obj->value[3] = 10;
  }

  // pierce
  if( !str_cmp( arg, "dagger" ) ) {
    snprintf(buf, MAX_INPUT_LENGTH, "%s soul dagger", ch->name);
    obj->name = str_dup(buf);
    free_string(obj->short_descr);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul dagger", ch->name);
    obj->short_descr = str_dup(buf);
    free_string(obj->description);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul dagger is lying here.", ch->name);
    obj->description = str_dup(buf);
    obj->value[3] = 11;
  }

  // suction
  if( !str_cmp( arg, "vacuum" ) ) {
    snprintf(buf, MAX_INPUT_LENGTH, "%s soul vacuum", ch->name);
    obj->name = str_dup(buf);
    free_string(obj->short_descr);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul vacuum", ch->name);
    obj->short_descr = str_dup(buf);
    free_string(obj->description);
    snprintf(buf, MAX_INPUT_LENGTH, "%s's soul vacuum is lying here.", ch->name);
    obj->description = str_dup(buf);
    obj->value[3] = 12;
  }

  obj_to_char(obj, ch);
  act("$p fades into existance in your hand.", ch, obj, NULL, TO_CHAR);
  act("$p fades into existance in $n's hand.", ch, obj, NULL, TO_ROOM);
  return;
}

void spell_mana(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  if (ch->move < 50)
  {
    send_to_char("You are too exhausted to do that.\n\r", ch);
    return;
  }
  ch->move = ch->move - 50;
  victim->mana = UMIN(victim->mana + level + 10, victim->max_mana);
  update_pos(ch);
  update_pos(victim);
  if (ch == victim)
  {
    send_to_char("You draw in energy from your surrounding area.\n\r",
      ch);
    act("$n draws in energy from $s surrounding area.\n\r", ch, NULL, NULL,
      TO_ROOM);
    return;
  }
  act("You draw in energy from around you and channel it into $N.\n\r",
    ch, NULL, victim, TO_CHAR);
  act("$n draws in energy and channels it into $N.\n\r",
    ch, NULL, victim, TO_NOTVICT);
  act("$n draws in energy and channels it into you.\n\r",
    ch, NULL, victim, TO_VICT);
  return;
}

void spell_frenzy(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA af;

  if (ch->position == POS_FIGHTING || is_affected(victim, sn))
    return;
  af.type = sn;
  af.duration = 10 + level / 10;
  af.location = APPLY_hit_chance;
  if(IS_NPC(ch))
  {
    af.modifier = level / 5;
  }
  else
  {
    af.modifier = ch->pcdata->perm_dex + (level / 5);
  }

  af.bitvector = 0;
  affect_to_char(victim, &af);

  af.location = APPLY_attack_power;
  if(IS_NPC(ch))
  {
    af.modifier = level / 5;
  }
  else
  {
    af.modifier = ch->pcdata->perm_str + (level / 5);
  }

  affect_to_char(victim, &af);

  af.location = APPLY_AC;

  if(IS_NPC(ch))
  {
    af.modifier = level / 2;
  }
  else
  {
    af.modifier = ch->pcdata->perm_str + (level / 2);
  }

  affect_to_char(victim, &af);
  if (ch != victim)
    send_to_char("Ok.\n\r", ch);
  send_to_char("You are consumed with rage!\n\r", victim);
  if (!IS_NPC(ch))
    do_beastlike(ch, "");
  return;
}

void spell_darkblessing(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  AFFECT_DATA af;

  int temp_mana = (ch->max_mana);
  if (ch->position == POS_FIGHTING || is_affected(victim, sn))
    return;

  af.type = sn;

  if (temp_mana > 5000)
    af.duration = (level / 2) + (temp_mana / 1000);
  else
    af.duration = level / 2;

  af.location = APPLY_hit_chance;

  if (temp_mana > 5000)
    af.modifier = (GET_hit_chance(ch) + (temp_mana / 2000))/10;
  else
    af.modifier = GET_hit_chance(ch) / 10;

  af.bitvector = 0;
  affect_to_char(victim, &af);
  af.location = APPLY_attack_power;
  if (temp_mana > 5000)
    af.modifier = (GET_attack_power(ch) + (temp_mana / 2000))/10;
  else
    af.modifier = GET_attack_power(ch) / 10;

  affect_to_char(victim, &af);

  if (ch != victim)
    send_to_char("Ok.\n\r", ch);

  send_to_char("You feel wicked.\n\r", victim);
  return;
}

void spell_portal(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim;
  OBJ_DATA *obj;
  char arg[MAX_INPUT_LENGTH];
  int duration;

  one_argument(target_name, arg, MAX_INPUT_LENGTH);

  if (arg[0] == '\0')
  {
    send_to_char("Who do you wish to create a portal to?\n\r", ch);
    return;
  }

  victim = get_char_world(ch, arg);

  if ((victim = get_char_world(ch, target_name)) == NULL || victim == ch || victim->in_room == NULL || IS_NPC(ch) || IS_NPC(victim) || (!IS_NPC(victim) && !IS_IMMUNE(victim, IMM_SUMMON)) || (!IS_NPC(ch) && !IS_IMMUNE(ch, IMM_SUMMON)) || IS_SET(ch->in_room->room_flags, ROOM_PRIVATE)

/* world wide portal for GS in all players, added by Archon */
|| ((victim->in_room->area_number != ch->in_room->area_number) &&
  (ch->spl[SPELL_PURPLE] != 200 ||
    ch->spl[SPELL_RED] != 200 ||
ch->spl[SPELL_BLUE] != 200 ||
ch->spl[SPELL_GREEN] != 200 ||
ch->spl[SPELL_YELLOW] != 200))

|| IS_SET(ch->in_room->room_flags, ROOM_SOLITARY) || IS_SET(ch->in_room->room_flags, ROOM_NO_RECALL) || ch->in_room->area_number == 111 || IS_SET(victim->in_room->room_flags, ROOM_PRIVATE) || IS_SET(victim->in_room->room_flags, ROOM_SOLITARY) || IS_SET(victim->in_room->room_flags, ROOM_NO_RECALL) || IS_SET(victim->in_room->room_flags, ROOM_NO_TELEPORT) || victim->in_room->vnum == ch->in_room->vnum || (IS_AFFECTED(ch, AFF_SHADOWPLANE) && !IS_AFFECTED(victim, AFF_SHADOWPLANE)) || (!IS_AFFECTED(ch, AFF_SHADOWPLANE) && IS_AFFECTED(victim, AFF_SHADOWPLANE)))
  {
    send_to_char("You failed.\n\r", ch);
    return;
  }

  duration = number_range(1, 2);

  obj = create_object(get_obj_index(OBJ_VNUM_PORTAL), 0);
  obj->value[0] = victim->in_room->vnum;
  obj->value[3] = ch->in_room->vnum;
  obj->timer = duration;
  if (IS_AFFECTED(ch, AFF_SHADOWPLANE))
    obj->extra_flags = ITEM_SHADOWPLANE;
  obj_to_room(obj, ch->in_room);

  obj = create_object(get_obj_index(OBJ_VNUM_PORTAL), 0);
  obj->value[0] = ch->in_room->vnum;
  obj->value[3] = victim->in_room->vnum;
  obj->timer = duration;
  if (IS_AFFECTED(victim, AFF_SHADOWPLANE))
    obj->extra_flags = ITEM_SHADOWPLANE;
  obj_to_room(obj, victim->in_room);

  act("$p appears in front of $n.", ch, obj, NULL, TO_ROOM);
  act("$p appears in front of you.", ch, obj, NULL, TO_CHAR);
  act("$p appears in front of $n.", victim, obj, NULL, TO_ROOM);
  act("$p appears in front of you.", ch, obj, victim, TO_VICT);
  return;
}

/* This spell is designed for potions */
void spell_energyflux(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;

  victim->mana = UMIN(victim->mana + 50, victim->max_mana);
  update_pos(victim);
  send_to_char("You feel mana channel into your body.\n\r", victim);
  return;
}

void spell_voodoo(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  OBJ_DATA *obj;
  char buf[MAX_INPUT_LENGTH];
  char arg[MAX_INPUT_LENGTH];
  char part1[MAX_INPUT_LENGTH];
  char part2[MAX_INPUT_LENGTH];
  int worn;

  one_argument(target_name, arg, MAX_INPUT_LENGTH);

  victim = get_char_world(ch, arg);

  if (ch->primal < 5)
  {
    send_to_char("It costs 5 points of primal energy to create a voodoo doll.\n\r", ch);
    return;
  }

  if ((victim = get_char_world(ch, target_name)) == NULL)
  {
    send_to_char("Nobody by that name is playing.\n\r", ch);
    return;
  }

  if ((obj = get_eq_char(ch, WEAR_WIELD)) == NULL)
  {
    if ((obj = get_eq_char(ch, WEAR_HOLD)) == NULL)
    {
      send_to_char("You are not holding any body parts.\n\r", ch);
      return;
    }
    else
      worn = WEAR_HOLD;
  }
  else
    worn = WEAR_WIELD;

  if (IS_NPC(victim))
  {
    send_to_char("Not on NPC's.\n\r", ch);
    return;
  }

  if (obj->value[2] == 12)
    snprintf(part1, MAX_INPUT_LENGTH, "head %s", victim->name);
  else if (obj->value[2] == 13)
    snprintf(part1, MAX_INPUT_LENGTH, "heart %s", victim->name);
  else if (obj->value[2] == 14)
    snprintf(part1, MAX_INPUT_LENGTH, "arm %s", victim->name);
  else if (obj->value[2] == 15)
    snprintf(part1, MAX_INPUT_LENGTH, "leg %s", victim->name);
  else if (obj->value[2] == 30004)
    snprintf(part1, MAX_INPUT_LENGTH, "entrails %s", victim->name);
  else if (obj->value[2] == 30005)
    snprintf(part1, MAX_INPUT_LENGTH, "brain %s", victim->name);
  else if (obj->value[2] == 30006)
    snprintf(part1, MAX_INPUT_LENGTH, "eye eyeball %s", victim->name);
  else if (obj->value[2] == 30012)
    snprintf(part1, MAX_INPUT_LENGTH, "face %s", victim->name);
  else if (obj->value[2] == 30013)
    snprintf(part1, MAX_INPUT_LENGTH, "windpipe %s", victim->name);
  else if (obj->value[2] == 30014)
    snprintf(part1, MAX_INPUT_LENGTH, "cracked head %s", victim->name);
  else if (obj->value[2] == 30025)
    snprintf(part1, MAX_INPUT_LENGTH, "ear %s", victim->name);
  else if (obj->value[2] == 30026)
    snprintf(part1, MAX_INPUT_LENGTH, "nose %s", victim->name);
  else if (obj->value[2] == 30027)
    snprintf(part1, MAX_INPUT_LENGTH, "tooth %s", victim->name);
  else if (obj->value[2] == 30028)
    snprintf(part1, MAX_INPUT_LENGTH, "tongue %s", victim->name);
  else if (obj->value[2] == 30029)
    snprintf(part1, MAX_INPUT_LENGTH, "hand %s", victim->name);
  else if (obj->value[2] == 30030)
    snprintf(part1, MAX_INPUT_LENGTH, "foot %s", victim->name);
  else if (obj->value[2] == 30031)
    snprintf(part1, MAX_INPUT_LENGTH, "thumb %s", victim->name);
  else if (obj->value[2] == 30032)
    snprintf(part1, MAX_INPUT_LENGTH, "index finger %s", victim->name);
  else if (obj->value[2] == 30033)
    snprintf(part1, MAX_INPUT_LENGTH, "middle finger %s", victim->name);
  else if (obj->value[2] == 30034)
    snprintf(part1, MAX_INPUT_LENGTH, "ring finger %s", victim->name);
  else if (obj->value[2] == 30035)
    snprintf(part1, MAX_INPUT_LENGTH, "little finger %s", victim->name);
  else if (obj->value[2] == 30036)
    snprintf(part1, MAX_INPUT_LENGTH, "toe %s", victim->name);
  else
  {
    snprintf(buf, MAX_INPUT_LENGTH, "%s isn't a part of %s!\n\r", obj->name, victim->name);
    send_to_char(buf, ch);
    return;
  }

  snprintf(part2, MAX_INPUT_LENGTH, "%s", obj->name);

  if (str_cmp(part1, part2))
  {
    snprintf(buf, MAX_INPUT_LENGTH, "But you are holding %s, not %s!\n\r", obj->short_descr, victim->name);
    send_to_char(buf, ch);
    return;
  }

  act("$p vanishes from your hand in a puff of smoke.", ch, obj, NULL, TO_CHAR);
  act("$p vanishes from $n's hand in a puff of smoke.", ch, obj, NULL, TO_ROOM);
  obj_from_char(obj);
  extract_obj(obj);

  obj = create_object(get_obj_index(OBJ_VNUM_VOODOO_DOLL), 0);

  snprintf(buf, MAX_INPUT_LENGTH, "%s voodoo doll", victim->name);
  free_string(obj->name);
  obj->name = str_dup(buf);

  snprintf(buf, MAX_INPUT_LENGTH, "a voodoo doll of %s", victim->name);
  free_string(obj->short_descr);
  obj->short_descr = str_dup(buf);

  snprintf(buf, MAX_INPUT_LENGTH, "A voodoo doll of %s lies here.", victim->name);
  free_string(obj->description);
  obj->description = str_dup(buf);

  obj_to_char(obj, ch);
  equip_char(ch, obj, worn);

  act("$p appears in your hand.", ch, obj, NULL, TO_CHAR);
  act("$p appears in $n's hand.", ch, obj, NULL, TO_ROOM);

  ch->primal -= 5;

  return;
}

void spell_transport(int sn, int level, CHAR_DATA *ch, void *vo)
{
  char arg1[MAX_INPUT_LENGTH];
  char arg2[MAX_INPUT_LENGTH];
  OBJ_DATA *obj;
  CHAR_DATA *victim;

  target_name = one_argument(target_name, arg1, MAX_INPUT_LENGTH);
  target_name = one_argument(target_name, arg2, MAX_INPUT_LENGTH);

  if (arg1[0] == '\0')
  {
    send_to_char("Transport which object?\n\r", ch);
    return;
  }

  if (arg2[0] == '\0')
  {
    send_to_char("Transport who whom?\n\r", ch);
    return;
  }
  if ((victim = get_char_world(ch, arg2)) == NULL)
  {
    send_to_char("They aren't here.\n\r", ch);
    return;
  }

  if ((obj = get_obj_carry(ch, arg1)) == NULL)
  {
    send_to_char("You are not carrying that item.\n\r", ch);
    return;
  }

  if (obj->item_type == ITEM_CONTAINER)
  {
    send_to_char("You cannot transport containers.\n\r", ch);
    return;
  }

  if ((IS_SET(victim->in_room->room_flags, ROOM_NO_TRANSPORT)) || ((ch->level < LEVEL_SEER) && (IS_SET(victim->act, PLR_NOTRANS))))
  {
    send_to_char("Something is blocking the transport.\n\r", ch);
    return;
  }

  act("$p vanishes from your hands in an swirl of smoke.", ch, obj, NULL, TO_CHAR);
  act("$p vanishes from $n's hands in a swirl of smoke.", ch, obj, NULL, TO_ROOM);
  obj_from_char(obj);
  obj_to_char(obj, victim);
  act("$p appears in your hands in an swirl of smoke.", victim, obj, NULL, TO_CHAR);
  act("$p appears in $n's hands in an swirl of smoke.", victim, obj, NULL, TO_ROOM);
  return;
}

void spell_regenerate(int sn, int level, CHAR_DATA *ch, void *vo)
{
  char arg1[MAX_INPUT_LENGTH];
  char arg2[MAX_INPUT_LENGTH];
  OBJ_DATA *obj;
  CHAR_DATA *victim;
  int teeth = 0;

  target_name = one_argument(target_name, arg1, MAX_INPUT_LENGTH);
  target_name = one_argument(target_name, arg2, MAX_INPUT_LENGTH);

  if (arg1[0] == '\0')
  {
    send_to_char("Which body part?\n\r", ch);
    return;
  }

  if (arg2[0] == '\0')
  {
    send_to_char("Regenerate which person?\n\r", ch);
    return;
  }
  if ((victim = get_char_room(ch, arg2)) == NULL)
  {
    send_to_char("They aren't here.\n\r", ch);
    return;
  }

  if (victim->loc_hp[6] > 0)
  {
    send_to_char("You cannot regenerate someone who is still bleeding.\n\r", ch);
    return;
  }

  if ((obj = get_obj_carry(ch, arg1)) == NULL)
  {
    send_to_char("You are not carrying that item.\n\r", ch);
    return;
  }

  if (IS_HEAD(victim, LOST_TOOTH_1))
    teeth += 1;
  if (IS_HEAD(victim, LOST_TOOTH_2))
    teeth += 2;
  if (IS_HEAD(victim, LOST_TOOTH_4))
    teeth += 4;
  if (IS_HEAD(victim, LOST_TOOTH_8))
    teeth += 8;
  if (IS_HEAD(victim, LOST_TOOTH_16))
    teeth += 16;

  if (obj->pIndexData->vnum == OBJ_VNUM_SLICED_ARM)
  {
    if (!IS_ARM_L(victim, LOST_ARM) && !IS_ARM_R(victim, LOST_ARM))
    {
      send_to_char("They don't need an arm.\n\r", ch);
      return;
    }
    if (IS_ARM_L(victim, LOST_ARM))
      REMOVE_BIT(victim->loc_hp[LOC_ARM_L], LOST_ARM);
    else if (IS_ARM_R(victim, LOST_ARM))
      REMOVE_BIT(victim->loc_hp[LOC_ARM_R], LOST_ARM);
    act("You press $p onto the stump of $N's shoulder.", ch, obj, victim, TO_CHAR);
    act("$n presses $p onto the stump of $N's shoulder.", ch, obj, victim, TO_NOTVICT);
    act("$n presses $p onto the stump of your shoulder.", ch, obj, victim, TO_VICT);
    extract_obj(obj);
    return;
  }
  else if (obj->pIndexData->vnum == OBJ_VNUM_SLICED_LEG)
  {
    if (!IS_LEG_L(victim, LOST_LEG) && !IS_LEG_R(victim, LOST_LEG))
    {
      send_to_char("They don't need a leg.\n\r", ch);
      return;
    }
    if (IS_LEG_L(victim, LOST_LEG))
      REMOVE_BIT(victim->loc_hp[LOC_LEG_L], LOST_LEG);
    else if (IS_LEG_R(victim, LOST_LEG))
      REMOVE_BIT(victim->loc_hp[LOC_LEG_R], LOST_LEG);
    act("You press $p onto the stump of $N's hip.", ch, obj, victim, TO_CHAR);
    act("$n presses $p onto the stump of $N's hip.", ch, obj, victim, TO_NOTVICT);
    act("$n presses $p onto the stump of your hip.", ch, obj, victim, TO_VICT);
    extract_obj(obj);
    return;
  }
  else if (obj->pIndexData->vnum == OBJ_VNUM_SQUIDGY_EYEBALL)
  {
    if (!IS_HEAD(victim, LOST_EYE_L) && !IS_HEAD(victim, LOST_EYE_R))
    {
      send_to_char("They don't need an eye.\n\r", ch);
      return;
    }
    if (IS_HEAD(victim, LOST_EYE_L))
      REMOVE_BIT(victim->loc_hp[LOC_HEAD], LOST_EYE_L);
    else if (IS_HEAD(victim, LOST_EYE_R))
      REMOVE_BIT(victim->loc_hp[LOC_HEAD], LOST_EYE_R);
    act("You press $p into $N's empty eye socket.", ch, obj, victim, TO_CHAR);
    act("$n presses $p into $N's empty eye socket.", ch, obj, victim, TO_NOTVICT);
    act("$n presses $p into your empty eye socket.", ch, obj, victim, TO_VICT);
    extract_obj(obj);
    return;
  }
  else if (obj->pIndexData->vnum == OBJ_VNUM_SLICED_EAR)
  {
    if (!IS_HEAD(victim, LOST_EAR_L) && !IS_HEAD(victim, LOST_EAR_R))
    {
      send_to_char("They don't need an ear.\n\r", ch);
      return;
    }
    if (IS_HEAD(victim, LOST_EAR_L))
      REMOVE_BIT(victim->loc_hp[LOC_HEAD], LOST_EAR_L);
    else if (IS_HEAD(victim, LOST_EAR_R))
      REMOVE_BIT(victim->loc_hp[LOC_HEAD], LOST_EAR_R);
    act("You press $p onto the side of $N's head.", ch, obj, victim, TO_CHAR);
    act("$n presses $p onto the side of $N's head.", ch, obj, victim, TO_NOTVICT);
    act("$n presses $p onto the side of your head.", ch, obj, victim, TO_VICT);
    extract_obj(obj);
    return;
  }
  else if (obj->pIndexData->vnum == OBJ_VNUM_SLICED_NOSE)
  {
    if (!IS_HEAD(victim, LOST_NOSE))
    {
      send_to_char("They don't need a nose.\n\r", ch);
      return;
    }
    REMOVE_BIT(victim->loc_hp[LOC_HEAD], LOST_NOSE);
    act("You press $p onto the front of $N's face.", ch, obj, victim, TO_CHAR);
    act("$n presses $p onto the front of $N's face.", ch, obj, victim, TO_NOTVICT);
    act("$n presses $p onto the front of your face.", ch, obj, victim, TO_VICT);
    extract_obj(obj);
    return;
  }
  else if (obj->pIndexData->vnum == OBJ_VNUM_SEVERED_HAND)
  {
    if (!IS_ARM_L(victim, LOST_ARM) && IS_ARM_L(victim, LOST_HAND))
      REMOVE_BIT(victim->loc_hp[LOC_ARM_L], LOST_HAND);
    else if (!IS_ARM_R(victim, LOST_ARM) && IS_ARM_R(victim, LOST_HAND))
      REMOVE_BIT(victim->loc_hp[LOC_ARM_R], LOST_HAND);
    else
    {
      send_to_char("They don't need a hand.\n\r", ch);
      return;
    }
    act("You press $p onto the stump of $N's wrist.", ch, obj, victim, TO_CHAR);
    act("$n presses $p onto the stump of $N's wrist.", ch, obj, victim, TO_NOTVICT);
    act("$n presses $p onto the stump of your wrist.", ch, obj, victim, TO_VICT);
    extract_obj(obj);
    return;
  }
  else if (obj->pIndexData->vnum == OBJ_VNUM_SEVERED_FOOT)
  {
    if (!IS_LEG_L(victim, LOST_LEG) && IS_LEG_L(victim, LOST_FOOT))
      REMOVE_BIT(victim->loc_hp[LOC_LEG_L], LOST_FOOT);
    else if (!IS_LEG_R(victim, LOST_LEG) && IS_LEG_R(victim, LOST_FOOT))
      REMOVE_BIT(victim->loc_hp[LOC_LEG_R], LOST_FOOT);
    else
    {
      send_to_char("They don't need a foot.\n\r", ch);
      return;
    }
    act("You press $p onto the stump of $N's ankle.", ch, obj, victim, TO_CHAR);
    act("$n presses $p onto the stump of $N's ankle.", ch, obj, victim, TO_NOTVICT);
    act("$n presses $p onto the stump of your ankle.", ch, obj, victim, TO_VICT);
    extract_obj(obj);
    return;
  }
  else if (obj->pIndexData->vnum == OBJ_VNUM_SEVERED_THUMB)
  {
    if (!IS_ARM_L(victim, LOST_ARM) && !IS_ARM_L(victim, LOST_HAND) && IS_ARM_L(victim, LOST_THUMB))
      REMOVE_BIT(victim->loc_hp[LOC_ARM_L], LOST_THUMB);
    else if (!IS_ARM_R(victim, LOST_ARM) && !IS_ARM_R(victim, LOST_HAND) && IS_ARM_R(victim, LOST_THUMB))
      REMOVE_BIT(victim->loc_hp[LOC_ARM_R], LOST_THUMB);
    else
    {
      send_to_char("They don't need a thumb.\n\r", ch);
      return;
    }
    act("You press $p onto $N's hand.", ch, obj, victim, TO_CHAR);
    act("$n presses $p onto $N's hand.", ch, obj, victim, TO_NOTVICT);
    act("$n presses $p onto your hand.", ch, obj, victim, TO_VICT);
    extract_obj(obj);
    return;
  }
  else if (obj->pIndexData->vnum == OBJ_VNUM_SEVERED_INDEX)
  {
    if (!IS_ARM_L(victim, LOST_ARM) && !IS_ARM_L(victim, LOST_HAND) && IS_ARM_L(victim, LOST_FINGER_I))
      REMOVE_BIT(victim->loc_hp[LOC_ARM_L], LOST_FINGER_I);
    else if (!IS_ARM_R(victim, LOST_ARM) && !IS_ARM_R(victim, LOST_HAND) && IS_ARM_R(victim, LOST_FINGER_I))
      REMOVE_BIT(victim->loc_hp[LOC_ARM_R], LOST_FINGER_I);
    else
    {
      send_to_char("They don't need an index finger.\n\r", ch);
      return;
    }
    act("You press $p onto $N's hand.", ch, obj, victim, TO_CHAR);
    act("$n presses $p onto $N's hand.", ch, obj, victim, TO_NOTVICT);
    act("$n presses $p onto your hand.", ch, obj, victim, TO_VICT);
    extract_obj(obj);
    return;
  }
  else if (obj->pIndexData->vnum == OBJ_VNUM_SEVERED_MIDDLE)
  {
    if (!IS_ARM_L(victim, LOST_ARM) && !IS_ARM_L(victim, LOST_HAND) && IS_ARM_L(victim, LOST_FINGER_M))
      REMOVE_BIT(victim->loc_hp[LOC_ARM_L], LOST_FINGER_M);
    else if (!IS_ARM_R(victim, LOST_ARM) && !IS_ARM_R(victim, LOST_HAND) && IS_ARM_R(victim, LOST_FINGER_M))
      REMOVE_BIT(victim->loc_hp[LOC_ARM_R], LOST_FINGER_M);
    else
    {
      send_to_char("They don't need a middle finger.\n\r", ch);
      return;
    }
    act("You press $p onto $N's hand.", ch, obj, victim, TO_CHAR);
    act("$n presses $p onto $N's hand.", ch, obj, victim, TO_NOTVICT);
    act("$n presses $p onto your hand.", ch, obj, victim, TO_VICT);
    extract_obj(obj);
    return;
  }
  else if (obj->pIndexData->vnum == OBJ_VNUM_SEVERED_RING)
  {
    if (!IS_ARM_L(victim, LOST_ARM) && !IS_ARM_L(victim, LOST_HAND) && IS_ARM_L(victim, LOST_FINGER_R))
      REMOVE_BIT(victim->loc_hp[LOC_ARM_L], LOST_FINGER_R);
    else if (!IS_ARM_R(victim, LOST_ARM) && !IS_ARM_R(victim, LOST_HAND) && IS_ARM_R(victim, LOST_FINGER_R))
      REMOVE_BIT(victim->loc_hp[LOC_ARM_R], LOST_FINGER_R);
    else
    {
      send_to_char("They don't need a ring finger.\n\r", ch);
      return;
    }
    act("You press $p onto $N's hand.", ch, obj, victim, TO_CHAR);
    act("$n presses $p onto $N's hand.", ch, obj, victim, TO_NOTVICT);
    act("$n presses $p onto your hand.", ch, obj, victim, TO_VICT);
    extract_obj(obj);
    return;
  }
  else if (obj->pIndexData->vnum == OBJ_VNUM_SEVERED_LITTLE)
  {
    if (!IS_ARM_L(victim, LOST_ARM) && !IS_ARM_L(victim, LOST_HAND) && IS_ARM_L(victim, LOST_FINGER_L))
      REMOVE_BIT(victim->loc_hp[LOC_ARM_L], LOST_FINGER_L);
    else if (!IS_ARM_R(victim, LOST_ARM) && !IS_ARM_R(victim, LOST_HAND) && IS_ARM_R(victim, LOST_FINGER_L))
      REMOVE_BIT(victim->loc_hp[LOC_ARM_R], LOST_FINGER_L);
    else
    {
      send_to_char("They don't need a little finger.\n\r", ch);
      return;
    }
    act("You press $p onto $N's hand.", ch, obj, victim, TO_CHAR);
    act("$n presses $p onto $N's hand.", ch, obj, victim, TO_NOTVICT);
    act("$n presses $p onto your hand.", ch, obj, victim, TO_VICT);
    extract_obj(obj);
    return;
  }
  else if (teeth > 0)
  {
    if (IS_HEAD(victim, LOST_TOOTH_1))
      REMOVE_BIT(victim->loc_hp[LOC_HEAD], LOST_TOOTH_1);
    if (IS_HEAD(victim, LOST_TOOTH_2))
      REMOVE_BIT(victim->loc_hp[LOC_HEAD], LOST_TOOTH_2);
    if (IS_HEAD(victim, LOST_TOOTH_4))
      REMOVE_BIT(victim->loc_hp[LOC_HEAD], LOST_TOOTH_4);
    if (IS_HEAD(victim, LOST_TOOTH_8))
      REMOVE_BIT(victim->loc_hp[LOC_HEAD], LOST_TOOTH_8);
    if (IS_HEAD(victim, LOST_TOOTH_16))
      REMOVE_BIT(victim->loc_hp[LOC_HEAD], LOST_TOOTH_16);
    teeth -= 1;
    if (teeth >= 16)
    {
      teeth -= 16;
      SET_BIT(victim->loc_hp[LOC_HEAD], LOST_TOOTH_16);
    }
    if (teeth >= 8)
    {
      teeth -= 8;
      SET_BIT(victim->loc_hp[LOC_HEAD], LOST_TOOTH_8);
    }
    if (teeth >= 4)
    {
      teeth -= 4;
      SET_BIT(victim->loc_hp[LOC_HEAD], LOST_TOOTH_4);
    }
    if (teeth >= 2)
    {
      teeth -= 2;
      SET_BIT(victim->loc_hp[LOC_HEAD], LOST_TOOTH_2);
    }
    if (teeth >= 1)
    {
      teeth -= 1;
      SET_BIT(victim->loc_hp[LOC_HEAD], LOST_TOOTH_1);
    }
    act("You press $p into $N's mouth.", ch, obj, victim, TO_CHAR);
    act("$n presses $p into $N's mouth.", ch, obj, victim, TO_NOTVICT);
    act("$n presses $p into your mouth.", ch, obj, victim, TO_VICT);
    extract_obj(obj);
  }
  else
  {
    act("There is nowhere to stick $p on $N.", ch, obj, victim, TO_CHAR);
    return;
  }
  return;
}

void spell_clot(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  if (IS_BLEEDING(victim, BLEEDING_HEAD))
  {
    act("$n's head stops bleeding.", victim, NULL, NULL, TO_ROOM);
    act("Your head stops bleeding.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[6], BLEEDING_HEAD);
  }
  else if (IS_BLEEDING(victim, BLEEDING_THROAT))
  {
    act("$n's throat stops bleeding.", victim, NULL, NULL, TO_ROOM);
    act("Your throat stops bleeding.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[6], BLEEDING_THROAT);
  }
  else if (IS_BLEEDING(victim, BLEEDING_ARM_L))
  {
    act("The stump of $n's left arm stops bleeding.", victim, NULL, NULL, TO_ROOM);
    act("The stump of your left arm stops bleeding.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[6], BLEEDING_ARM_L);
  }
  else if (IS_BLEEDING(victim, BLEEDING_ARM_R))
  {
    act("The stump of $n's right arm stops bleeding.", victim, NULL, NULL, TO_ROOM);
    act("The stump of your right arm stops bleeding.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[6], BLEEDING_ARM_R);
  }
  else if (IS_BLEEDING(victim, BLEEDING_LEG_L))
  {
    act("The stump of $n's left leg stops bleeding.", victim, NULL, NULL, TO_ROOM);
    act("The stump of your left leg stops bleeding.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[6], BLEEDING_LEG_L);
  }
  else if (IS_BLEEDING(victim, BLEEDING_LEG_R))
  {
    act("The stump of $n's right leg stops bleeding.", victim, NULL, NULL, TO_ROOM);
    act("The stump of your right leg stops bleeding.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[6], BLEEDING_LEG_R);
  }
  else if (IS_BLEEDING(victim, BLEEDING_HAND_L))
  {
    act("The stump of $n's left wrist stops bleeding.", victim, NULL, NULL, TO_ROOM);
    act("The stump of your left wrist stops bleeding.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[6], BLEEDING_HAND_L);
  }
  else if (IS_BLEEDING(victim, BLEEDING_HAND_R))
  {
    act("The stump of $n's right wrist stops bleeding.", victim, NULL, NULL, TO_ROOM);
    act("The stump of your right wrist stops bleeding.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[6], BLEEDING_HAND_R);
  }
  else if (IS_BLEEDING(victim, BLEEDING_FOOT_L))
  {
    act("The stump of $n's left ankle stops bleeding.", victim, NULL, NULL, TO_ROOM);
    act("The stump of your left ankle stops bleeding.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[6], BLEEDING_FOOT_L);
  }
  else if (IS_BLEEDING(victim, BLEEDING_FOOT_R))
  {
    act("The stump of $n's right ankle stops bleeding.", victim, NULL, NULL, TO_ROOM);
    act("The stump of your right ankle stops bleeding.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[6], BLEEDING_FOOT_R);
  }
  else
    send_to_char("They have no wounds to clot.\n\r", ch);
  return;
}

void spell_mend(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim = (CHAR_DATA *)vo;
  int ribs = 0;

  if (IS_BODY(victim, BROKEN_RIBS_1))
    ribs += 1;
  if (IS_BODY(victim, BROKEN_RIBS_2))
    ribs += 2;
  if (IS_BODY(victim, BROKEN_RIBS_4))
    ribs += 4;
  if (IS_BODY(victim, BROKEN_RIBS_8))
    ribs += 8;
  if (IS_BODY(victim, BROKEN_RIBS_16))
    ribs += 16;

  if (ribs > 0)
  {
    if (IS_BODY(victim, BROKEN_RIBS_1))
      REMOVE_BIT(victim->loc_hp[1], BROKEN_RIBS_1);
    if (IS_BODY(victim, BROKEN_RIBS_2))
      REMOVE_BIT(victim->loc_hp[1], BROKEN_RIBS_2);
    if (IS_BODY(victim, BROKEN_RIBS_4))
      REMOVE_BIT(victim->loc_hp[1], BROKEN_RIBS_4);
    if (IS_BODY(victim, BROKEN_RIBS_8))
      REMOVE_BIT(victim->loc_hp[1], BROKEN_RIBS_8);
    if (IS_BODY(victim, BROKEN_RIBS_16))
      REMOVE_BIT(victim->loc_hp[1], BROKEN_RIBS_16);
    ribs -= 1;
    if (ribs >= 16)
    {
      ribs -= 16;
      SET_BIT(victim->loc_hp[1], BROKEN_RIBS_16);
    }
    if (ribs >= 8)
    {
      ribs -= 8;
      SET_BIT(victim->loc_hp[1], BROKEN_RIBS_8);
    }
    if (ribs >= 4)
    {
      ribs -= 4;
      SET_BIT(victim->loc_hp[1], BROKEN_RIBS_4);
    }
    if (ribs >= 2)
    {
      ribs -= 2;
      SET_BIT(victim->loc_hp[1], BROKEN_RIBS_2);
    }
    if (ribs >= 1)
    {
      ribs -= 1;
      SET_BIT(victim->loc_hp[1], BROKEN_RIBS_1);
    }
    act("One of $n's ribs snap back into place.", victim, NULL, NULL, TO_ROOM);
    act("One of your ribs snap back into place.", victim, NULL, NULL, TO_CHAR);
  }
  else if (IS_HEAD(victim, BROKEN_NOSE))
  {
    act("$n's nose snaps back into place.", victim, NULL, NULL, TO_ROOM);
    act("Your nose snaps back into place.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[LOC_HEAD], BROKEN_NOSE);
  }
  else if (IS_HEAD(victim, BROKEN_JAW))
  {
    act("$n's jaw snaps back into place.", victim, NULL, NULL, TO_ROOM);
    act("Your jaw snaps back into place.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[LOC_HEAD], BROKEN_JAW);
  }
  else if (IS_HEAD(victim, BROKEN_SKULL))
  {
    act("$n's skull knits itself back together.", victim, NULL, NULL, TO_ROOM);
    act("Your skull knits itself back together.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[LOC_HEAD], BROKEN_SKULL);
  }
  else if (IS_BODY(victim, BROKEN_SPINE))
  {
    act("$n's spine knits itself back together.", victim, NULL, NULL, TO_ROOM);
    act("Your spine knits itself back together.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[LOC_BODY], BROKEN_SPINE);
  }
  else if (IS_BODY(victim, BROKEN_NECK))
  {
    act("$n's neck snaps back into place.", victim, NULL, NULL, TO_ROOM);
    act("Your neck snaps back into place.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[LOC_BODY], BROKEN_NECK);
  }
  else if (IS_ARM_L(victim, BROKEN_ARM) && !IS_ARM_L(victim, LOST_ARM))
  {
    act("$n's left arm snaps back into place.", victim, NULL, NULL, TO_ROOM);
    act("Your left arm snaps back into place.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[LOC_ARM_L], BROKEN_ARM);
  }
  else if (IS_ARM_R(victim, BROKEN_ARM) && !IS_ARM_R(victim, LOST_ARM))
  {
    act("$n's right arm snaps back into place.", victim, NULL, NULL, TO_ROOM);
    act("Your right arm snaps back into place.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[LOC_ARM_R], BROKEN_ARM);
  }
  else if (IS_LEG_L(victim, BROKEN_LEG) && !IS_LEG_L(victim, LOST_LEG))
  {
    act("$n's left leg snaps back into place.", victim, NULL, NULL, TO_ROOM);
    act("Your left leg snaps back into place.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[LOC_LEG_L], BROKEN_LEG);
  }
  else if (IS_LEG_R(victim, BROKEN_LEG) && !IS_LEG_R(victim, LOST_LEG))
  {
    act("$n's right leg snaps back into place.", victim, NULL, NULL, TO_ROOM);
    act("Your right leg snaps back into place.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[LOC_LEG_R], BROKEN_LEG);
  }
  else if (IS_ARM_L(victim, BROKEN_THUMB) && !IS_ARM_L(victim, LOST_ARM) && !IS_ARM_L(victim, LOST_HAND))
  {
    act("$n's left thumb snaps back into place.", victim, NULL, NULL, TO_ROOM);
    act("Your left thumb snaps back into place.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[LOC_ARM_L], BROKEN_THUMB);
  }
  else if (IS_ARM_L(victim, BROKEN_FINGER_I) && !IS_ARM_L(victim, LOST_ARM) && !IS_ARM_L(victim, LOST_HAND))
  {
    act("$n's left index finger snaps back into place.", victim, NULL, NULL, TO_ROOM);
    act("Your left index finger snaps back into place.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[LOC_ARM_L], BROKEN_FINGER_I);
  }
  else if (IS_ARM_L(victim, BROKEN_FINGER_M) && !IS_ARM_L(victim, LOST_ARM) && !IS_ARM_L(victim, LOST_HAND))
  {
    act("$n's left middle finger snaps back into place.", victim, NULL, NULL, TO_ROOM);
    act("Your left middle finger snaps back into place.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[LOC_ARM_L], BROKEN_FINGER_M);
  }
  else if (IS_ARM_L(victim, BROKEN_FINGER_R) && !IS_ARM_L(victim, LOST_ARM) && !IS_ARM_L(victim, LOST_HAND))
  {
    act("$n's left ring finger snaps back into place.", victim, NULL, NULL, TO_ROOM);
    act("Your left ring finger snaps back into place.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[LOC_ARM_L], BROKEN_FINGER_R);
  }
  else if (IS_ARM_L(victim, BROKEN_FINGER_L) && !IS_ARM_L(victim, LOST_ARM) && !IS_ARM_L(victim, LOST_HAND))
  {
    act("$n's left little finger snaps back into place.", victim, NULL, NULL, TO_ROOM);
    act("Your left little finger snaps back into place.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[LOC_ARM_L], BROKEN_FINGER_L);
  }
  else if (IS_ARM_R(victim, BROKEN_THUMB) && !IS_ARM_R(victim, LOST_ARM) && !IS_ARM_R(victim, LOST_HAND))
  {
    act("$n's right thumb snaps back into place.", victim, NULL, NULL, TO_ROOM);
    act("Your right thumb snaps back into place.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[LOC_ARM_R], BROKEN_THUMB);
  }
  else if (IS_ARM_R(victim, BROKEN_FINGER_I) && !IS_ARM_R(victim, LOST_ARM) && !IS_ARM_R(victim, LOST_HAND))
  {
    act("$n's right index finger snaps back into place.", victim, NULL, NULL, TO_ROOM);
    act("Your right index finger snaps back into place.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[LOC_ARM_R], BROKEN_FINGER_I);
  }
  else if (IS_ARM_R(victim, BROKEN_FINGER_M) && !IS_ARM_R(victim, LOST_ARM) && !IS_ARM_R(victim, LOST_HAND))
  {
    act("$n's right middle finger snaps back into place.", victim, NULL, NULL, TO_ROOM);
    act("Your right middle finger snaps back into place.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[LOC_ARM_R], BROKEN_FINGER_M);
  }
  else if (IS_ARM_R(victim, BROKEN_FINGER_R) && !IS_ARM_R(victim, LOST_ARM) && !IS_ARM_R(victim, LOST_HAND))
  {
    act("$n's right ring finger snaps back into place.", victim, NULL, NULL, TO_ROOM);
    act("Your right ring finger snaps back into place.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[LOC_ARM_R], BROKEN_FINGER_R);
  }
  else if (IS_ARM_R(victim, BROKEN_FINGER_L) && !IS_ARM_R(victim, LOST_ARM) && !IS_ARM_R(victim, LOST_HAND))
  {
    act("$n's right little finger snaps back into place.", victim, NULL, NULL, TO_ROOM);
    act("Your right little finger snaps back into place.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[LOC_ARM_R], BROKEN_FINGER_L);
  }
  else if (IS_BODY(victim, CUT_THROAT))
  {
    act("The wound in $n's throat closes up.", victim, NULL, NULL, TO_ROOM);
    act("The wound in your throat closes up.", victim, NULL, NULL, TO_CHAR);
    REMOVE_BIT(victim->loc_hp[LOC_BODY], CUT_THROAT);
  }
  else
    send_to_char("They have no bones to mend.\n\r", ch);
  return;
}

void spell_quest(int sn, int level, CHAR_DATA *ch, void *vo)
{
  return;
}

void spell_minor_creation(int sn, int level, CHAR_DATA *ch, void *vo)
{
  OBJ_DATA *obj;
  char arg[MAX_INPUT_LENGTH];
  char buf[MAX_INPUT_LENGTH];
  char itemkind[10];
  int itemtype;

  target_name = one_argument(target_name, arg, MAX_INPUT_LENGTH);
  if (ch->mana < ch->max_mana / 4)
  {
    ch->mana += 50;
    send_to_char("You don't have enough mana.\n\r", ch);
    return;
  }
  ch->mana -= ch->max_mana / 4;

  if (!str_cmp(arg, "potion"))
  {
    itemtype = ITEM_POTION;
    snprintf(itemkind, 10, "potion");
  }
  else if (!str_cmp(arg, "scroll"))
  {
    itemtype = ITEM_SCROLL;
    snprintf(itemkind, 10, "scroll");
  }
  else if (!str_cmp(arg, "wand"))
  {
    itemtype = ITEM_WAND;
    snprintf(itemkind, 10, "wand");
  }
  else if (!str_cmp(arg, "staff"))
  {
    itemtype = ITEM_STAFF;
    snprintf(itemkind, 10, "staff");
  }
  else if (!str_cmp(arg, "pill"))
  {
    itemtype = ITEM_PILL;
    snprintf(itemkind, 10, "pill");
  }
  else
  {
    send_to_char("Item can be one of: Potion, Scroll, Wand, Staff or Pill.\n\r", ch);
    return;
  }
  obj = create_object(get_obj_index(OBJ_VNUM_PROTOPLASM), 0);
  obj->item_type = itemtype;

  /* FIX FOR CRASH BUG - ARCHON */
  if (obj->item_type == ITEM_WAND || obj->item_type == ITEM_STAFF)
  obj->value[1] = 1;

  snprintf(buf, MAX_INPUT_LENGTH, "%s %s", ch->name, itemkind);
  free_string(obj->name);
  obj->name = str_dup(buf);
  snprintf(buf, MAX_INPUT_LENGTH, "%s's %s", ch->name, itemkind);
  free_string(obj->short_descr);
  obj->short_descr = str_dup(buf);
  snprintf(buf, MAX_INPUT_LENGTH, "%s's %s lies here.", ch->name, itemkind);
  free_string(obj->description);
  obj->description = str_dup(buf);
  obj->weight = 5;
  if (obj->questmaker != NULL)
    free_string(obj->questmaker);
  obj->questmaker = str_dup(ch->name);

  obj_to_char(obj, ch);
  act("$p suddenly appears in your hands.", ch, obj, NULL, TO_CHAR);
  act("$p suddenly appears in $n's hands.", ch, obj, NULL, TO_ROOM);
  return;
}

void spell_brew(int sn, int level, CHAR_DATA *ch, void *vo)
{
  char arg1[MAX_INPUT_LENGTH];
  char arg2[MAX_INPUT_LENGTH];
  char buf[MAX_INPUT_LENGTH];
  char col[10];
  OBJ_DATA *obj;

  target_name = one_argument(target_name, arg1, MAX_INPUT_LENGTH);
  target_name = one_argument(target_name, arg2, MAX_INPUT_LENGTH);

  if (IS_NPC(ch))
    return;
  if (arg1[0] == '\0' || arg2[0] == '\0')
  {
    send_to_char("What spell do you wish to brew, and on what?\n\r", ch);
    return;
  }

  if ((sn = skill_lookup(arg2)) < 0 || (!IS_NPC(ch) && ch->level < skill_table[sn].skill_level[ch->class]))
  {
    send_to_char("You can't do that.\n\r", ch);
    return;
  }

  if (sn == 70 || sn == 6 || sn == 32 || sn == 84)
  {
    send_to_char("You cannot brew that spell.\n\r", ch);
    return;
  }

  if (ch->pcdata->learned[sn] < 100)
  {
    send_to_char("You are not adept at that spell.\n\r", ch);
    return;
  }

  if ((obj = get_obj_carry(ch, arg1)) == NULL)
  {
    send_to_char("You are not carrying that.\n\r", ch);
    return;
  }

  if (obj->item_type != ITEM_POTION)
  {
    send_to_char("That is not a potion.\n\r", ch);
    return;
  }

  if (obj->value[0] != 0 || obj->value[1] != 0 ||
obj->value[2] != 0 || obj->value[3] != 0)
  {
    send_to_char("You need an empty potion bottle.\n\r", ch);
    return;
  }

  if (skill_table[sn].target == 1)
  {
    send_to_char("You cannot brew red spells.\n\r", ch);
    return;
  }

  if (skill_table[sn].target == 0)
  {
    obj->value[0] = ch->spl[SPELL_PURPLE] / 4;
    snprintf(col, 10, "purple");
  }
  else if (skill_table[sn].target == 1)
  {
    obj->value[0] = ch->spl[SPELL_RED] / 4;
    snprintf(col, 10, "red");
  }
  else if (skill_table[sn].target == 2)
  {
    obj->value[0] = ch->spl[SPELL_BLUE] / 4;
    snprintf(col, 10, "blue");
  }
  else if (skill_table[sn].target == 3)
  {
    obj->value[0] = ch->spl[SPELL_GREEN] / 4;
    snprintf(col, 10, "green");
  }
  else if (skill_table[sn].target == 4)
  {
    obj->value[0] = ch->spl[SPELL_YELLOW] / 4;
    snprintf(col, 10, "yellow");
  }
  else
  {
    send_to_char("Oh dear...big bug...please inform The Admin.\n\r", ch);
    return;
  }
  obj->value[1] = sn;
  if (obj->value[0] >= 25)
    obj->value[2] = sn;
  else
    obj->value[2] = -1;
  if (obj->value[0] == 50)
    obj->value[3] = sn;
  else
    obj->value[3] = -1;
  free_string(obj->name);
  snprintf(buf, MAX_INPUT_LENGTH, "%s potion %s %s", ch->name, col, skill_table[sn].name);
  obj->name = str_dup(buf);
  free_string(obj->short_descr);
  snprintf(buf, MAX_INPUT_LENGTH, "%s's %s potion of %s", ch->name, col, skill_table[sn].name);
  obj->short_descr = str_dup(buf);
  free_string(obj->description);
  snprintf(buf, MAX_INPUT_LENGTH, "A %s potion is lying here.", col);
  obj->description = str_dup(buf);
  act("You brew $p.", ch, obj, NULL, TO_CHAR);
  act("$n brews $p.", ch, obj, NULL, TO_ROOM);
  return;
}

void spell_scribe(int sn, int level, CHAR_DATA *ch, void *vo)
{
  char arg1[MAX_INPUT_LENGTH];
  char arg2[MAX_INPUT_LENGTH];
  char buf[MAX_INPUT_LENGTH];
  char col[10];
  OBJ_DATA *obj;

  target_name = one_argument(target_name, arg1, MAX_INPUT_LENGTH);
  target_name = one_argument(target_name, arg2, MAX_INPUT_LENGTH);

  if (IS_NPC(ch))
    return;
  if (arg1[0] == '\0' || arg2[0] == '\0')
  {
    send_to_char("What spell do you wish to scribe, and on what?\n\r", ch);
    return;
  }

  if ((sn = skill_lookup(arg2)) < 0 || (!IS_NPC(ch) && ch->level < skill_table[sn].skill_level[ch->class]))
  {
    send_to_char("You can't do that.\n\r", ch);
    return;
  }
  if (sn == 70 || sn == 6 || sn == 32 || sn == 84)
  {
    send_to_char("You cannot brew that spell.\n\r", ch);
    return;
  }

  if (ch->pcdata->learned[sn] < 100)
  {
    send_to_char("You are not adept at that spell.\n\r", ch);
    return;
  }

  if ((obj = get_obj_carry(ch, arg1)) == NULL)
  {
    send_to_char("You are not carrying that.\n\r", ch);
    return;
  }

  if (!str_cmp(strlower(arg2), "guardian"))
  {
    send_to_char("You cannot do that.\n\r", ch);
    return;
  }

  if (obj->item_type != ITEM_SCROLL)
  {
    send_to_char("That is not a scroll.\n\r", ch);
    return;
  }

  if (obj->value[0] != 0 || obj->value[1] != 0 ||
obj->value[2] != 0 || obj->value[3] != 0)
  {
    send_to_char("You need an empty scroll parchment.\n\r", ch);
    return;
  }

  if (skill_table[sn].target == 1)
  {
    send_to_char("You cannot use red spells for this.\n\r", ch);
    return;
  }

  if (skill_table[sn].target == 0)
  {
    obj->value[0] = ch->spl[SPELL_PURPLE] / 4;
    snprintf(col, 10, "purple");
  }
  else if (skill_table[sn].target == 1)
  {
    obj->value[0] = ch->spl[SPELL_RED] / 4;
    snprintf(col, 10, "red");
  }
  else if (skill_table[sn].target == 2)
  {
    obj->value[0] = ch->spl[SPELL_BLUE] / 4;
    snprintf(col, 10, "blue");
  }
  else if (skill_table[sn].target == 3)
  {
    obj->value[0] = ch->spl[SPELL_GREEN] / 4;
    snprintf(col, 10, "green");
  }
  else if (skill_table[sn].target == 4)
  {
    obj->value[0] = ch->spl[SPELL_YELLOW] / 4;
    snprintf(col, 10, "yellow");
  }
  else
  {
    send_to_char("**BUG** eeeeep find a coder!\n\r", ch);
    return;
  }
  obj->value[1] = sn;
  if (obj->value[0] >= 25)
    obj->value[2] = sn;
  else
    obj->value[2] = -1;
  if (obj->value[0] == 50)
    obj->value[3] = sn;
  else
    obj->value[3] = -1;
  free_string(obj->name);
  snprintf(buf, MAX_INPUT_LENGTH, "%s scroll %s %s", ch->name, col, skill_table[sn].name);
  obj->name = str_dup(buf);
  free_string(obj->short_descr);
  snprintf(buf, MAX_INPUT_LENGTH, "%s's %s scroll of %s", ch->name, col, skill_table[sn].name);
  obj->short_descr = str_dup(buf);
  free_string(obj->description);
  snprintf(buf, MAX_INPUT_LENGTH, "A %s scroll is lying here.", col);
  obj->description = str_dup(buf);
  act("You scribe $p.", ch, obj, NULL, TO_CHAR);
  act("$n scribes $p.", ch, obj, NULL, TO_ROOM);
  return;
}

void spell_carve(int sn, int level, CHAR_DATA *ch, void *vo)
{
  char arg1[MAX_INPUT_LENGTH];
  char arg2[MAX_INPUT_LENGTH];
  char buf[MAX_INPUT_LENGTH];
  char col[10];
  OBJ_DATA *obj;

  target_name = one_argument(target_name, arg1, MAX_INPUT_LENGTH);
  target_name = one_argument(target_name, arg2, MAX_INPUT_LENGTH);

  if (IS_NPC(ch))
    return;
  if (arg1[0] == '\0' || arg2[0] == '\0')
  {
    send_to_char("What spell do you wish to carve, and on what?\n\r", ch);
    return;
  }

  if ((sn = skill_lookup(arg2)) < 0 || (!IS_NPC(ch) && ch->level < skill_table[sn].skill_level[ch->class]))
  {
    send_to_char("You can't do that.\n\r", ch);
    return;
  }

  if (ch->pcdata->learned[sn] < 100)
  {
    send_to_char("You are not adept at that spell.\n\r", ch);
    return;
  }

  if (!str_cmp(strlower(arg2), "guardian"))
  {
    send_to_char("You cannot do that.\n\r", ch);
    return;
  }

  if (!str_cmp(strlower(arg2), "mount"))
  {
    send_to_char("You cannot do that.\n\r", ch);
    return;
  }

  if (!str_cmp(strlower(arg2), "clone"))
  {
    send_to_char("You cannot do that.\n\r", ch);
    return;
  }

  if ((obj = get_obj_carry(ch, arg1)) == NULL)
  {
    send_to_char("You are not carrying that.\n\r", ch);
    return;
  }

  if (obj->item_type != ITEM_WAND)
  {
    send_to_char("That is not a wand.\n\r", ch);
    return;
  }

  if (obj->value[0] != 0 || obj->value[1] != 1 ||
obj->value[2] != 0 || obj->value[3] != 0)
  {
    send_to_char("You need an unenchanted wand.\n\r", ch);
    return;
  }
  if (skill_table[sn].target == 0)
  {
    obj->value[0] = ch->spl[SPELL_PURPLE] / 4;
    snprintf(col, 10, "purple");
  }
  else if (skill_table[sn].target == 1)
  {
    obj->value[0] = ch->spl[SPELL_RED] / 4;
    snprintf(col, 10, "red");
  }
  else if (skill_table[sn].target == 2)
  {
    obj->value[0] = ch->spl[SPELL_BLUE] / 4;
    snprintf(col, 10, "blue");
  }
  else if (skill_table[sn].target == 3)
  {
    obj->value[0] = ch->spl[SPELL_GREEN] / 4;
    snprintf(col, 10, "green");
  }
  else if (skill_table[sn].target == 4)
  {
    obj->value[0] = ch->spl[SPELL_YELLOW] / 4;
    snprintf(col, 10, "yellow");
  }
  else
  {
    send_to_char("Oh dear...big bug...please inform KaVir.\n\r", ch);
    return;
  }
  obj->value[1] = (obj->value[0] / 5) + 1;
  obj->value[2] = (obj->value[0] / 5) + 1;
  obj->value[3] = sn;
  free_string(obj->name);
  snprintf(buf, MAX_INPUT_LENGTH, "%s wand %s %s", ch->name, col, skill_table[sn].name);
  obj->name = str_dup(buf);
  free_string(obj->short_descr);
  snprintf(buf, MAX_INPUT_LENGTH, "%s's %s wand of %s", ch->name, col, skill_table[sn].name);
  obj->short_descr = str_dup(buf);
  free_string(obj->description);
  snprintf(buf, MAX_INPUT_LENGTH, "A %s wand is lying here.", col);
  obj->description = str_dup(buf);
  obj->wear_flags = ITEM_TAKE + ITEM_HOLD;
  act("You carve $p.", ch, obj, NULL, TO_CHAR);
  act("$n carves $p.", ch, obj, NULL, TO_ROOM);
  return;
}

void spell_engrave(int sn, int level, CHAR_DATA *ch, void *vo)
{
  char arg1[MAX_INPUT_LENGTH];
  char arg2[MAX_INPUT_LENGTH];
  char buf[MAX_INPUT_LENGTH];
  char col[10];
  OBJ_DATA *obj;

  target_name = one_argument(target_name, arg1, MAX_INPUT_LENGTH);
  target_name = one_argument(target_name, arg2, MAX_INPUT_LENGTH);

  if (IS_NPC(ch))
    return;
  if (arg1[0] == '\0' || arg2[0] == '\0')
  {
    send_to_char("What spell do you wish to engrave, and on what?\n\r", ch);
    return;
  }

  if (!str_cmp(strlower(arg2), "guardian"))
  {
    send_to_char("You cannot do that.\n\r", ch);
    return;
  }

  if (!str_cmp(strlower(arg2), "mount"))
  {
    send_to_char("You cannot do that.\n\r", ch);
    return;
  }

  if (!str_cmp(strlower(arg2), "clone"))
  {
    send_to_char("You cannot do that.\n\r", ch);
    return;
  }

  if ((sn = skill_lookup(arg2)) < 0 || (!IS_NPC(ch) && ch->level < skill_table[sn].skill_level[ch->class]))
  {
    send_to_char("You can't do that.\n\r", ch);
    return;
  }

  if (ch->pcdata->learned[sn] < 100)
  {
    send_to_char("You are not adept at that spell.\n\r", ch);
    return;
  }

  if ((obj = get_obj_carry(ch, arg1)) == NULL)
  {
    send_to_char("You are not carrying that.\n\r", ch);
    return;
  }

  if (obj->item_type != ITEM_STAFF)
  {
    send_to_char("That is not a staff.\n\r", ch);
    return;
  }

  if (obj->value[0] != 0 || obj->value[1] != 1 ||
obj->value[2] != 0 || obj->value[3] != 0)
  {
    send_to_char("You need an unenchanted staff.\n\r", ch);
    return;
  }
  if (skill_table[sn].target == 0)
  {
    obj->value[0] = (ch->spl[SPELL_PURPLE] + 1) / 4;
    snprintf(col, 10, "purple");
  }
  else if (skill_table[sn].target == 1)
  {
    obj->value[0] = (ch->spl[SPELL_RED] + 1) / 4;
    snprintf(col, 10, "red");
  }
  else if (skill_table[sn].target == 2)
  {
    obj->value[0] = (ch->spl[SPELL_BLUE] + 1) / 4;
    snprintf(col, 10, "blue");
  }
  else if (skill_table[sn].target == 3)
  {
    obj->value[0] = (ch->spl[SPELL_GREEN] + 1) / 4;
    snprintf(col, 10, "green");
  }
  else if (skill_table[sn].target == 4)
  {
    obj->value[0] = (ch->spl[SPELL_YELLOW] + 1) / 4;
    snprintf(col, 10, "yellow");
  }
  else
  {
    send_to_char("Oh dear...big bug...please inform KaVir.\n\r", ch);
    return;
  }
  obj->value[1] = (obj->value[0] / 10) + 1;
  obj->value[2] = (obj->value[0] / 10) + 1;
  obj->value[3] = sn;
  free_string(obj->name);
  snprintf(buf, MAX_INPUT_LENGTH, "%s staff %s %s", ch->name, col, skill_table[sn].name);
  obj->name = str_dup(buf);
  free_string(obj->short_descr);
  snprintf(buf, MAX_INPUT_LENGTH, "%s's %s staff of %s", ch->name, col, skill_table[sn].name);
  obj->short_descr = str_dup(buf);
  free_string(obj->description);
  snprintf(buf, MAX_INPUT_LENGTH, "A %s staff is lying here.", col);
  obj->description = str_dup(buf);
  obj->wear_flags = ITEM_TAKE + ITEM_HOLD;
  act("You engrave $p.", ch, obj, NULL, TO_CHAR);
  act("$n engraves $p.", ch, obj, NULL, TO_ROOM);
  return;
}

void spell_bake(int sn, int level, CHAR_DATA *ch, void *vo)
{
  char arg1[MAX_INPUT_LENGTH];
  char arg2[MAX_INPUT_LENGTH];
  char buf[MAX_INPUT_LENGTH];
  char col[10];
  OBJ_DATA *obj;

  target_name = one_argument(target_name, arg1, MAX_INPUT_LENGTH);
  target_name = one_argument(target_name, arg2, MAX_INPUT_LENGTH);

  if (IS_NPC(ch))
    return;
  if (arg1[0] == '\0' || arg2[0] == '\0')
  {
    send_to_char("What spell do you wish to bake, and on what?\n\r", ch);
    return;
  }

  if ((sn = skill_lookup(arg2)) < 0 || (!IS_NPC(ch) && ch->level < skill_table[sn].skill_level[ch->class]))
  {
    send_to_char("You can't do that.\n\r", ch);
    return;
  }
  if (sn == 70 || sn == 6 || sn == 32 || sn == 84)
  {
    send_to_char("You cannot brew that spell.\n\r", ch);
    return;
  }

  if (ch->pcdata->learned[sn] < 100)
  {
    send_to_char("You are not adept at that spell.\n\r", ch);
    return;
  }

  if ((obj = get_obj_carry(ch, arg1)) == NULL)
  {
    send_to_char("You are not carrying that.\n\r", ch);
    return;
  }

  if (obj->item_type != ITEM_PILL)
  {
    send_to_char("That is not a pill.\n\r", ch);
    return;
  }

  if (!str_cmp(strlower(arg2), "guardian"))
  {
    send_to_char("You cannot do that.\n\r", ch);
    return;
  }

  if (obj->value[0] != 0 || obj->value[1] != 0 ||
obj->value[2] != 0 || obj->value[3] != 0)
  {
    send_to_char("You need an unused pill.\n\r", ch);
    return;
  }

  if (skill_table[sn].target == 1)
  {
    send_to_char("You cannot use red spells for this.\n\r", ch);
    return;
  }

  if (skill_table[sn].target == 0)
  {
    obj->value[0] = ch->spl[SPELL_PURPLE] / 4;
    snprintf(col, 10, "purple");
  }
  else if (skill_table[sn].target == 1)
  {
    obj->value[0] = ch->spl[SPELL_RED] / 4;
    snprintf(col, 10, "red");
  }
  else if (skill_table[sn].target == 2)
  {
    obj->value[0] = ch->spl[SPELL_BLUE] / 4;
    snprintf(col, 10, "blue");
  }
  else if (skill_table[sn].target == 3)
  {
    obj->value[0] = ch->spl[SPELL_GREEN] / 4;
    snprintf(col, 10, "green");
  }
  else if (skill_table[sn].target == 4)
  {
    obj->value[0] = ch->spl[SPELL_YELLOW] / 4;
    snprintf(col, 10, "yellow");
  }
  else
  {
    send_to_char("Oh dear...big bug...please inform KaVir.\n\r", ch);
    return;
  }
  obj->value[1] = sn;
  if (obj->value[0] >= 25)
    obj->value[2] = sn;
  else
    obj->value[2] = -1;
  if (obj->value[0] == 50)
    obj->value[3] = sn;
  else
    obj->value[3] = -1;
  free_string(obj->name);
  snprintf(buf, MAX_INPUT_LENGTH, "%s pill %s %s", ch->name, col, skill_table[sn].name);
  obj->name = str_dup(buf);
  free_string(obj->short_descr);
  snprintf(buf, MAX_INPUT_LENGTH, "%s's %s pill of %s", ch->name, col, skill_table[sn].name);
  obj->short_descr = str_dup(buf);
  free_string(obj->description);
  snprintf(buf, MAX_INPUT_LENGTH, "A %s pill is lying here.", col);
  obj->description = str_dup(buf);
  act("You bake $p.", ch, obj, NULL, TO_CHAR);
  act("$n bakes $p.", ch, obj, NULL, TO_ROOM);
  return;
}

void spell_mount(int sn, int level, CHAR_DATA *ch, void *vo)
{
  char buf[MAX_INPUT_LENGTH];
  CHAR_DATA *victim;

  if (IS_NPC(ch))
    return;

  victim = create_mobile(get_mob_index(MOB_VNUM_MOUNT));
  victim->level = 5;
  victim->armor = 0 - (2 * (level + 1)) - (ch->max_hit/50);
  victim->hit_chance = level;
  victim->attack_power = level;
  victim->hit = 100 * level;
  victim->max_hit = 100 * level;
  SET_BIT(victim->affected_by, AFF_FLYING);

  if( ch->remortlevel > 0 )
  {
    victim->armor *= 1.25 * ch->remortlevel;
    victim->hit_chance *= 1.25 * ch->remortlevel;
    victim->attack_power *= 1.25 * ch->remortlevel;
    victim->hit *= 1.25 * ch->remortlevel;
    victim->max_hit *= 1.25 * ch->remortlevel;
  }

  if (IS_GOOD(ch) && !IS_SET(ch->act, PLR_VAMPIRE))
  {
    free_string(victim->name);
    victim->name = str_dup("mount white horse pegasus");
    snprintf(buf, MAX_INPUT_LENGTH, "%s's white pegasus", ch->name);
    free_string(victim->short_descr);
    victim->short_descr = str_dup(buf);
    free_string(victim->long_descr);
    victim->long_descr = str_dup("A beautiful white pegasus stands here.\n\r");
  }

  else if (IS_NEUTRAL(ch) && !IS_SET(ch->act, PLR_VAMPIRE))
  {
    free_string(victim->name);
    victim->name = str_dup("mount griffin");
    snprintf(buf, MAX_INPUT_LENGTH, "%s's griffin", ch->name);
    free_string(victim->short_descr);
    victim->short_descr = str_dup(buf);
    free_string(victim->long_descr);
    victim->long_descr = str_dup("A vicious looking griffin stands here.\n\r");
  }

  else if (!str_cmp(ch->clan, "Ventrue"))
  {
    free_string(victim->name);
    victim->name = str_dup("mount gold golden dragon");
    snprintf(buf, MAX_INPUT_LENGTH, "%s's golden dragon", ch->name);
    free_string(victim->short_descr);
    victim->short_descr = str_dup(buf);
    free_string(victim->long_descr);
    victim->long_descr = str_dup("A magnificent golden dragon stands here.\n\r");
  }

  else if (!str_cmp(ch->clan, "Lasombra"))
  {
    free_string(victim->name);
    victim->name = str_dup("mount wolf spectral");
    snprintf(buf, MAX_INPUT_LENGTH, "%s's spectral wolf", ch->name);
    free_string(victim->short_descr);
    victim->short_descr = str_dup(buf);
    free_string(victim->long_descr);
    victim->long_descr = str_dup("A huge spectral wolf hovers here.\n\r");
  }

  else if (!str_cmp(ch->clan, "Assamite"))
  {
    free_string(victim->name);
    victim->name = str_dup("mount wyvern vicious ");
    snprintf(buf, MAX_INPUT_LENGTH, "%s's vicious wyvern", ch->name);
    free_string(victim->short_descr);
    victim->short_descr = str_dup(buf);
    free_string(victim->long_descr);
    victim->long_descr = str_dup("A trained battle wyvern stands here.\n\r");
  }

  else if (!str_cmp(ch->clan, "Toreador"))
  {
    free_string(victim->name);
    victim->name = str_dup("mount drake fire firedrake");
    snprintf(buf, MAX_INPUT_LENGTH, "%s's firedrake", ch->name);
    free_string(victim->short_descr);
    victim->short_descr = str_dup(buf);
    free_string(victim->long_descr);
    victim->long_descr = str_dup("A beautiful firedrake stands here.\n\r");
  }

  else if (!str_cmp(ch->clan, "Tzimisce"))
  {
    free_string(victim->name);
    victim->name = str_dup("mount pig flying");
    snprintf(buf, MAX_INPUT_LENGTH, "%s's flying pig", ch->name);
    free_string(victim->short_descr);
    victim->short_descr = str_dup(buf);
    free_string(victim->long_descr);
    victim->long_descr = str_dup("A winged pig stands here.\n\r");
  }

  else if (!str_cmp(ch->clan, "Tremere"))
  {
    free_string(victim->name);
    victim->name = str_dup("mount steed elemental");
    snprintf(buf, MAX_INPUT_LENGTH, "%s's elemental steed", ch->name);
    free_string(victim->short_descr);
    victim->short_descr = str_dup(buf);
    free_string(victim->long_descr);
    victim->long_descr = str_dup("A large horse of elemental fire stands here.\n\r");
  }

  else if (!str_cmp(ch->clan, "Caitiff"))
  {
    free_string(victim->name);
    victim->name = str_dup("mount giant raven");
    snprintf(buf, MAX_INPUT_LENGTH, "%s's giant raven", ch->name);
    free_string(victim->short_descr);
    victim->short_descr = str_dup(buf);
    free_string(victim->long_descr);
    victim->long_descr = str_dup("A huge, bright eyed, raven stands here.\n\r");
  }

  else
  {
    free_string(victim->name);
    victim->name = str_dup("mount black horse nightmare");
    snprintf(buf, MAX_INPUT_LENGTH, "%s's black nightmare", ch->name);
    free_string(victim->short_descr);
    victim->short_descr = str_dup(buf);
    free_string(victim->long_descr);
    victim->long_descr = str_dup("A large black demonic horse stands here.\n\r");
  }

  act("$N fades into existance.", ch, NULL, victim, TO_CHAR);
  act("$N fades into existance.", ch, NULL, victim, TO_ROOM);
  char_to_room(victim, ch->in_room);
  return;
}

void spell_scan(int sn, int level, CHAR_DATA *ch, void *vo)
{
  OBJ_DATA *obj;
  OBJ_DATA *obj_next;
  bool found = FALSE;

  for (obj = ch->carrying; obj != NULL; obj = obj_next)
  {
    obj_next = obj->next_content;
    if (obj->condition < 100 && can_see_obj(ch, obj))
    {
      found = TRUE;
      act("$p needs repairing.", ch, obj, NULL, TO_CHAR);
    }
  }
  if (!found)
  {
    send_to_char("None of your equipment needs repairing.\n\r", ch);
    return;
  }
  return;
}

void spell_repair(int sn, int level, CHAR_DATA *ch, void *vo)
{
  OBJ_DATA *obj;
  OBJ_DATA *obj_next;
  bool found = FALSE;

  for (obj = ch->carrying; obj != NULL; obj = obj_next)
  {
    obj_next = obj->next_content;
    if (obj->condition < 100 && can_see_obj(ch, obj))
    {
      found = TRUE;
      if(obj->condition == 0)
      {
        act("$p is fully broke and needs repaired at a smithy", ch, obj, NULL, TO_CHAR);
        continue;
      }
      obj->condition = 100;
      act("$p magically repairs itself.", ch, obj, NULL, TO_CHAR);
      act("$p magically repairs itself.", ch, obj, NULL, TO_ROOM);
    }
  }
  if (!found)
  {
    send_to_char("None of your equipment needs repairing.\n\r", ch);
    return;
  }
  return;
}

void spell_spellproof(int sn, int level, CHAR_DATA *ch, void *vo)
{
  OBJ_DATA *obj = (OBJ_DATA *)vo;

  if (IS_SET(obj->quest, QUEST_SPELLPROOF))
  {
    send_to_char("That item is already resistance to spells.\n\r", ch);
    return;
  }

  SET_BIT(obj->quest, QUEST_SPELLPROOF);
  act("$p shimmers for a moment.", ch, obj, NULL, TO_CHAR);
  act("$p shimmers for a moment.", ch, obj, NULL, TO_ROOM);
  return;
}

void spell_clone(int sn, int level, CHAR_DATA *ch, void *vo)
{
  CHAR_DATA *victim;
  /*	AFFECT_DATA af;	*/
  char buf[MAX_INPUT_LENGTH];

  victim = create_mobile(get_mob_index(MOB_VNUM_CLONE));
  victim->level = 5;
  victim->hit = 20 * level;
  victim->max_hit = 20 * level;
  victim->hit_chance = level;
  victim->attack_power = level;
  victim->armor = 100 - (level * 7);
  free_string(victim->name);
  snprintf(buf, MAX_INPUT_LENGTH, "%s clone", ch->name);
  victim->name = str_dup("clone");
  free_string(victim->long_descr);
  snprintf(buf, MAX_INPUT_LENGTH, "%s is standing here.\n\r", ch->name);
  victim->long_descr = str_dup(buf);
  free_string(victim->short_descr);
  snprintf(buf, MAX_INPUT_LENGTH, "%s", ch->name);
  victim->short_descr = str_dup(buf);

  send_to_char("A mirror image of you appears from the shadows.\n\r", ch);
  act("A clone of $N appears from the shadows.", ch, NULL, victim, TO_ROOM);
  char_to_room(victim, ch->in_room);

  /*	add_follower( victim, ch );
	af.type	  = sn;
	af.duration  = 666;
	af.location  = APPLY_NONE;
	af.modifier  = 0;
	af.bitvector = AFF_CHARM;
	affect_to_char( victim, &af );*/
  return;
}