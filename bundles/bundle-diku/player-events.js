'use strict';

const humanize = (sec) => { return require('humanize-duration')(sec, { round: true }); };
const { Broadcast: B, Config, Logger, SkillErrors } = require('ranvier');
const Combat = require('../bundle-diku-combat/lib/Combat');
const LevelUtil = require('./lib/LevelUtil');
const CombatErrors = require('../bundle-diku-combat/lib/CombatErrors');
const sprintf = require('sprintf-js').sprintf;

module.exports = {
  listeners: {

    /**
     * Handle a player movement command. From: 'commands' input event.
     * movementCommand is a result of CommandParser.parse
     */
    move: state => function (movementCommand) {
      const { roomExit } = movementCommand;

      if(this.getMeta('currentStance') !== 'none') {
        state.CommandManager.get('stance').execute('none', this);
      }

      if (!roomExit) {
        return B.sayAt(this, "You can't go that way!");
      }

      if (this.isInCombat()) {
        return B.sayAt(this, 'You are in the middle of a fight!');
      }

      const nextRoom = state.RoomManager.getRoom(roomExit.roomId);
      const oldRoom = this.room;

      const door = oldRoom.getDoor(nextRoom) || nextRoom.getDoor(oldRoom);

      if (door) {
        if (door.locked) {
          return B.sayAt(this, "The door is locked.");
        }

        if (door.closed) {
          return B.sayAt(this, "The door is closed.");
        }
      }

      this.moveTo(nextRoom, _ => {
        state.CommandManager.get('look').execute('', this);
      });

      B.sayAt(oldRoom, `${this.name} leaves.`);
      B.sayAtExcept(nextRoom, `${this.name} enters.`, this);

      for (const follower of this.followers) {
        if (follower.room !== oldRoom) {
          continue;
        }

        if (follower.isNpc) {
          follower.moveTo(nextRoom);
        } else {
          B.sayAt(follower, `\r\nYou follow ${this.name} to ${nextRoom.title}.`);
          follower.emit('move', movementCommand);
        }
      }

      if( this.getMeta('isHunting' ) ) {
        // TODO: Add in the call to find the target and bark it's direction back to the player
      }
    },

    save: state => async function (callback) {
      await state.PlayerManager.save(this);
      if (typeof callback === 'function') {
        callback();
      }
    },

    commandQueued: state => function (commandIndex) {
      const command = this.commandQueue.queue[commandIndex];
      const ttr = sprintf('%.1f', this.commandQueue.getTimeTilRun(commandIndex));
      B.sayAt(this, `<bold><yellow>Executing</yellow> '<white>${command.label}</white>' <yellow>in</yellow> <white>${ttr}</white> <yellow>seconds.</yellow>`);
    },

    updateTick: state => function () {
      if (this.commandQueue.hasPending && this.commandQueue.lagRemaining <= 0) {
        B.sayAt(this);
        this.commandQueue.execute();
        B.prompt(this);
      }
      const lastCommandTime = this._lastCommandTime || Infinity;
      const timeSinceLastCommand = Date.now() - lastCommandTime;
      const maxIdleTime = (Math.abs(Config.get('maxIdleTime')) * 60000) || Infinity;

      if (timeSinceLastCommand > maxIdleTime && !this.isInCombat()) {
        this.save(() => {
          B.sayAt(this, `You were kicked for being idle for more than ${maxIdleTime / 60000} minutes!`);
          B.sayAtExcept(this.room, `${this.name} disappears.`, this);
          Logger.log(`Kicked ${this.name} for being idle.`);
          state.PlayerManager.removePlayer(this, true);
        });
      }
    },

    /**
     * Handle player gaining experience
     * @param {number} amount Exp gained
     */
    experience: state => function (amount) {

      // Since we added in the ability to get EXP bonus as an attribute, we need to do something with it
      let bonusPercent = this.hasAttribute('exp_bonus') ? this.getAttribute('exp_bonus') : 0;

      // Calculate the bonus EXP and then upgrade
      let bonus = Math.floor(amount * ( bonusPercent/100 ));
      amount *= ( 1 + ( bonusPercent/100 ) );

      // Round the EXP down
      amount = Math.floor(amount);

      let bonusMessage = (bonusPercent) ? `(${bonus} bonus experience)` : "";

      B.sayAt(this, `<blue>You gained <bold>${amount}</bold> experience!</blue><yellow>${bonusMessage}</yellow>`);

      const totalTnl = LevelUtil.expToLevel(this.level + 1);

      // level up, currently wraps experience if they gain more than needed for multiple levels
      if (this.experience + amount > totalTnl) {
        B.sayAt(this, '                                   <bold><blue>!Level Up!</blue></bold>');
        B.sayAt(this, B.progress(80, 100, "blue"));

        let nextTnl = totalTnl;
        while (this.experience + amount > nextTnl) {
          amount = (this.experience + amount) - nextTnl;
          this.level++;
          this.experience = 0;
          nextTnl = LevelUtil.expToLevel(this.level + 1);
          B.sayAt(this, `<blue>You are now level <bold>${this.level}</bold>!</blue>`);
          this.emit('level');
        }
      }

      this.experience += amount;

      this.save();
    },

    useAbility: state => function (ability, args) {
      if (!this.playerClass.hasAbility(ability.id)) {
        return B.sayAt(this, 'Your class cannot use that ability.');
      }

      if (!this.playerClass.canUseAbility(this, ability.id)) {
        return B.sayAt(this, 'You have not yet learned that ability.');
      }

      let target = null;
      if (ability.requiresTarget) {
        if (!args || !args.length) {
          if (ability.targetSelf) {
            target = this;
          } else if (this.isInCombat()) {
            target = [...this.combatants][0];
          } else {
            target = null;
          }
        } else {
          try {
            const targetSearch = args.split(' ').pop();
            target = Combat.findCombatant(this, targetSearch);
          } catch (e) {
            if (
              e instanceof CombatErrors.CombatSelfError ||
              e instanceof CombatErrors.CombatNonPvpError ||
              e instanceof CombatErrors.CombatInvalidTargetError ||
              e instanceof CombatErrors.CombatPacifistError
            ) {
              return B.sayAt(this, e.message);
            }

            Logger.error(e.message);
          }
        }

        if (!target) {
          return B.sayAt(this, `Use ${ability.name} on whom?`);
        }
      }

      try {
        ability.execute(args, this, target);
      } catch (e) {
        if (e instanceof SkillErrors.CooldownError) {
          if (ability.cooldownGroup) {
            return B.sayAt(this, `Cannot use ${ability.name} while ${e.effect.skill.name} is on cooldown.`);
          }
          return B.sayAt(this, `${ability.name} is on cooldown. ${humanize(e.effect.remaining)} remaining.`);
        }

        if (e instanceof SkillErrors.PassiveError) {
          return B.sayAt(this, `That skill is passive.`);
        }

        if (e instanceof SkillErrors.NotEnoughResourcesError) {
          return B.sayAt(this, `You do not have enough resources.`);
        }

        Logger.error(e.message);
        B.sayAt(this, 'Huh?');
      }
    },

    /**
     * Handle player leveling up
     */
    level: state => function () {
      const abilities = this.playerClass.abilityTable;
      if (!(this.level in this.playerClass.abilityTable)) {
        return;
      }

      const newSkills = abilities[this.level].skills || [];
      for (const abilityId of newSkills) {
        const skill = state.SkillManager.get(abilityId);
        B.sayAt(this, `<bold><yellow>You can now use skill: ${skill.name}.</yellow></bold>`);
        skill.activate(this);
      }

      const newSpells = abilities[this.level].spells || [];
      for (const abilityId of newSpells) {
        const spell = state.SpellManager.get(abilityId);
        B.sayAt(this, `<bold><yellow>You can now use spell: ${spell.name}.</yellow></bold>`);
      }
    },

    equip: state => function (slot, item) {
      if (!item.metadata.stats) {
        return;
      }

      const config = {
        name: 'Equip: ' + slot,
        type: 'equip.' + slot
      };

      const effectState = {
        slot,
        stats: item.metadata.stats,
      };

      this.addEffect(state.EffectFactory.create(
        'equip',
        config,
        effectState
      ));
    },

    currency: state => function (currency, amount) {
      const friendlyName = currency.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      const key = `currencies.${currency}`;

      if (!this.getMeta('currencies')) {
        this.setMeta('currencies', {});
      }
      this.setMeta(key, (this.getMeta(key) || 0) + amount);
      this.save();

      B.sayAt(this, `<green>You receive currency: <b><white>[${friendlyName}]</white></b> x${amount}.`);
    },

    questStart: state => function (quest) {
      B.sayAt(this, `\r\n<bold><yellow>Quest Started: ${quest.config.title}!</yellow></bold>`);
      if (quest.config.description) {
        B.sayAt(this, B.line(80));
        B.sayAt(this, `<bold><yellow>${quest.config.description}</yellow></bold>`, 80);
      }

      if (quest.config.rewards.length) {
        B.sayAt(this);
        B.sayAt(this, '<b><yellow>' + B.center(80, 'Rewards') + '</yellow></b>');
        B.sayAt(this, '<b><yellow>' + B.center(80, '-------') + '</yellow></b>');

        for (const reward of quest.config.rewards) {
          const rewardClass = state.QuestRewardManager.get(reward.type);
          B.sayAt(this, '  ' + rewardClass.display(state, quest, reward.config, this));
        }
      }

      B.sayAt(this, B.line(80));
    },

    questProgress: state => function (quest, progress) {
      B.sayAt(this, `\r\n<bold><yellow>${progress.display}</yellow></bold>`);
    },

    questTurnInReady: state => function (quest) {
      B.sayAt(this, `<bold><yellow>${quest.config.title} ready to turn in!</yellow></bold>`);
    },

    questComplete: state => function (quest) {
      B.sayAt(this, `<bold><yellow>Quest Complete: ${quest.config.title}!</yellow></bold>`);

      if (quest.config.completionMessage) {
        B.sayAt(this, B.line(80));
        B.sayAt(this, quest.config.completionMessage);
      }
    },

    /**
     * Player received a quest reward
     * @param {object} reward Reward config _not_ an instance of QuestReward
     */
    questReward: state => function (reward) {
      // do stuff when the player receives a quest reward. Generally the Reward instance
      // will emit an event that will be handled elsewhere and display its own message
      // e.g., 'currency' or 'experience'. But if you want to handle that all in one
      // place instead, or you'd like to show some supplemental message you can do that here
    },
  }
};
