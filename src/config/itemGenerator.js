
const MATERIAL = {
  METAL: 'metal',
  STONE: 'stone',
  BONES: 'skeleton',
  CRYSTAL: 'crystal',
  WOOD: 'wood'
}

const TYPE = {
  CHEST: 'chest',
  DIAMOND: 'diamond',
  METAL: 'metal',
  POTION: 'potion',
  ROCK: 'rock',
  SHIELD: 'shield',
  SWORD: 'sword',
  WOOD: 'wood'
}

const SPECIAL = {
  ORDINARY: 'ordinary',
  MAGIC: 'magic',
  CURSED: 'cursed'
}

const BASE = {
  CHEST: {
    material: MATERIAL.WOOD,
    type: TYPE.CHEST,
    variations: 1
  },
  DIAMOND: {
    material: MATERIAL.WOOD,
    type: TYPE.CHEST,
    variations: 1
  },
  METAL: {
    material: MATERIAL.METAL,
    type: TYPE.METAL,
    variations: 1
  },
  POTION: {
    material: MATERIAL.CRYSTAL,
    type: TYPE.POTION,
    variations: 2
  },
  ROCK: {
    material: MATERIAL.STONE,
    type: TYPE.ROCK,
    variations: 1
  },
  SHIELD: {
    material: MATERIAL.METAL,
    type: TYPE.SHIELD,
    variations: 1
  },
  SWORD: {
    material: MATERIAL.METAL,
    type: TYPE.SWORD,
    variations: 1
  },
  WOOD: {
    material: MATERIAL.WOOD,
    type: TYPE.WOOD,
    variations: 1
  }
}

let generateItem = () => {
  // get a random object type
  let keys = Object.keys(BASE)
  let index = ~~(Math.random()*keys.length)
  let base = JSON.parse(JSON.stringify(BASE[keys[index]]))

  let variationType = ~~(Math.random()*base.variations)
  base.typeKey = base.type
  base.type = `${base.type}-${variationType}`
  base.special = SPECIAL[Object.keys(SPECIAL)[~~(Math.random()*Object.keys(SPECIAL).length)]]

  return base
}

export default generateItem