const config = {
  weapon: {
    types: [
      'hitting',
      'slicing',
      'stabbing',
      'slashing',
      'whipping',
      'clawing',
      'blasting',
      'pounding',
      'crushing',
      'grepping',
      'biting',
      'piercing',
      'sucking'
    ],
    thresholds: {
      0: "totally unskilled in",
      26: "slightly unskilled in",
      51: "fairly competent in",
      76: "highly skilled in",
      101: "very dangerous in",
      126: "extremely deadly in",
      151: "an expert in",
      176: "a master in",
      199: "on the verge of grand mastery of",
      200: "a grand master of"
    }
  },
  spellTypes: [
    'blue',
    'green',
    'purple',
    'red',
    'yellow'
  ],
  itemSlots: [
    {
      name: 'On Finger',
      slot: 'finger_l'
    },
    {
      name: 'On Finger',
      slot: 'finger_r'
    },
    {
      name: 'Around Neck',
      slot: 'neck'
    },
    {
      name: 'On Body',
      slot: 'body'
    },
    {
      name: 'On Head',
      slot: 'head'
    },
    {
      name: 'On Legs',
      slot: 'legs'
    },
    {
      name: 'On Feet',
      slot: 'feet'
    },
    {
      name: 'On Hands',
      slot: 'hands'
    },
    {
      name: 'On Arms',
      slot: 'arms'
    },
    {
      name: 'Off Hand',
      slot: ''
    },
    {
      name: 'Around Body',
      slot: 'about'
    },
    {
      name: 'Around Waist',
      slot: 'waist'
    },
    {
      name: 'Around Wrist',
      slot: 'wrist'
    },
    {
      name: 'Right Hand',
      slot: 'right_hand'
    },
    {
      name: 'Left Hand',
      slot: 'left_hand'
    },
    {
      name: 'On Face',
      slot: 'face'
    }
  ]
};

export default config;
