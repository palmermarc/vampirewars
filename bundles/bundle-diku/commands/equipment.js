'use strict';

const { Broadcast: B } = require('ranvier');
const ItemUtil = require('../lib/ItemUtil');

module.exports = {
  aliases: ['worn'],
  usage: 'equipment',
  command: (state) => (args, player) => {
    if (!player.equipment.size) {
      return B.sayAt(player, "You are completely naked!");
    }

    let itemSlots = {
      'finger_l'    : '[On Finger    ]',
      'finger_r'    : '[On Finger    ]',
      'neck'        : '[Around Neck  ]',
      'body'        : '[On Body      ]',
      'head'        : '[On Head      ]',
      'legs'        : '[On Legs      ]',
      'feet'        : '[On Feet      ]',
      'hands'       : '[On Hands     ]',
      'arms'        : '[On Arms      ]',
      'about'       : '[Around Body  ]',
      'waist'       : '[Around Waist ]',
      'left_wrist'  : '[Around Wrist ]',
      'right_wrist' : '[Around Wrist ]',
      'left_hand'   : '[Left Hand    ]',
      'right_hand'  : '[Right Hand   ]',
      'face'        : '[On Face      ]'
    };

    let totalItems = 0;

    B.sayAt(player, `You are using:`);

    Object.entries(itemSlots).forEach(itemSlot=> {
      const [eqSlot, display] = itemSlot;
      for (const [slot, item] of player.equipment) {
        if( slot === eqSlot ) {
          B.sayAt(player, `${display} ${ItemUtil.display(item)}`);
          totalItems++;
        }
      }
    });

    return B.sayAt(player, `Total items: ${totalItems}`);

  }
};
/**
  Broadcast.sayAt(player, "Currently Equipped:");
  for (const [slot, item] of player.equipment) {
    Broadcast.sayAt(player, `  <${slot}> ${ItemUtil.display(item)}`);
  }
 [On Finger     ]
 [On Finger     ]
 [Around Neck   ]
 [Around Neck   ] a newbie necklace
 [On Body       ] a newbie chestplate
 [On Head       ] a newbie helmet
 [On Legs       ] a pair of newbie leggings
 [On Feet       ] (Legendary) the claws of Typhoeus
 [On Hands      ] a pair of newbie gloves
 [On Arms       ] a pair of newbie armguards
 [Around Body   ] a newbie cloak
 [Around Waist  ] (Legendary) an aura of sanity
 [Around Wrist  ] (Legendary) a chitin bracer
 [Around Wrist  ] (Legendary) a chitin bracer
 [Right Hand    ] (Glowing) (Humming) Gratiano's soul sword
 [Left Hand     ] (Glowing) (Humming) Gratiano's soul sword
 [On Face       ] a newbie mask*/