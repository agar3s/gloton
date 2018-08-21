const MATERIAL = {
  METAL: 'metal',
  STONE: 'stone',
  BONES: 'skeleton',
  CRYSTAL: 'crystal',
  WOOD: 'wood'
};

const TYPE = {
  CHEST: 'chest',
  DIAMOND: 'diamond',
  METAL: 'metal',
  POTION: 'potion',
  ROCK: 'rock',
  SHIELD: 'shield',
  SWORD: 'sword',
  WOOD: 'wood'
};

const SPECIAL = {
  ORDINARY: 'ordinary',
  MAGIC: 'magic',
  CURSED: 'cursed'
};

const BASE = {
  CHEST: {
    material: MATERIAL.WOOD,
    type: TYPE.CHEST,
    variations: 2
  },
  DIAMOND: {
    material: MATERIAL.CRYSTAL,
    type: TYPE.DIAMOND,
    variations: 2
  },
  METAL: {
    material: MATERIAL.METAL,
    type: TYPE.METAL,
    variations: 2
  },
  POTION: {
    material: MATERIAL.CRYSTAL,
    type: TYPE.POTION,
    variations: 2
  },
  ROCK: {
    material: MATERIAL.STONE,
    type: TYPE.ROCK,
    variations: 2
  },
  SHIELD: {
    material: MATERIAL.METAL,
    type: TYPE.SHIELD,
    variations: 2
  },
  SWORD: {
    material: MATERIAL.METAL,
    type: TYPE.SWORD,
    variations: 2
  },
  WOOD: {
    material: MATERIAL.WOOD,
    type: TYPE.WOOD,
    variations: 2
  }
};

let generateItem = skipItemsArray => {
  // get a random object type
  let keys = Object.keys(BASE);
  let index = ~~(Math.random() * keys.length);
  let base = JSON.parse(JSON.stringify(BASE[keys[index]]));

  let variationType = ~~(Math.random() * base.variations);
  base.typeKey = base.type;
  base.type = `${base.type}-${variationType}`;
  base.special =
    SPECIAL[
      Object.keys(SPECIAL)[~~(Math.random() * Object.keys(SPECIAL).length)]
    ];

  // if you want to skip a specific item, pass a parameter
  if (skipItemsArray) {
    for (var i = 0; i < skipItemsArray.length; i++) {
      let skipItem = skipItemsArray[i];
      let equal = Object.keys(skipItem).every(
        key => base[key] === skipItem[key]
      );
      if (equal) {
        return generateItem(skipItemsArray);
      }
    }
  }

  return base;
};

export default generateItem;
