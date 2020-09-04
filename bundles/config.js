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
  ]
}

export default config;
