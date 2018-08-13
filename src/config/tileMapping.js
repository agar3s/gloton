// Our custom tile mapping with:
// - Single index for putTileAt
// - Array of weights for weightedRandomize
// - Array or 2D array for putTilesAt
const TILE_MAPPING = {
  BLANK: 21,
  WALL: {
    TOP_LEFT: 0,
    TOP_RIGHT: 3,
    BOTTOM_RIGHT: 103,
    BOTTOM_LEFT: 100,
    TOP: [{index: 102, weight: 1}],
    LEFT: [{ index: 40, weight: 4 }, { index: [40, 20], weight: 1 }],
    RIGHT: [{ index: 43, weight: 4 }, { index: [63, 23], weight: 1 }],
    BOTTOM: [{index: 121, weight: 1}]
  },
  FLOOR: [{ index: 39, weight: 9 }, { index: [19, 17, 18], weight: 1 }],
  POT: [{ index: 13, weight: 1 }, { index: 32, weight: 1 }, { index: 51, weight: 1 }],
  DOOR: {
    TOP: [264, 264, 264],
    // prettier-ignore
    LEFT: [
      [264],
      [264],
      [264]
    ],
    BOTTOM: [264, 264, 264],
    // prettier-ignore
    RIGHT: [
      [264],
      [264],
      [264]
    ]
  },
  CHEST: 283,
  STAIRS: 280,
  // prettier-ignore
  TOWER: [
    [280],
    [240]
  ]
};

export default TILE_MAPPING;
