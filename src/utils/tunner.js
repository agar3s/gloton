import constants from '../config/constants'
import gs from '../config/gameStats'

import * as dat from 'dat.gui'

let gui = {}

function initGui() {
  let folderGame = gui.addFolder('game')
  gui.remember(gs.stats.game)
  folderGame.addColor(gs.stats.game, 'backgroundColor')
  .onChange((val) => {
    gs.notifyListener('game.backgroundColor', val)
  })
  folderGame.add(gs.stats.game, 'debug')
  .onChange((val) => {
    gs.notifyListener('game.debug', val)
  })
  folderGame.open()

  let folderPlayer = gui.addFolder('player')
  gui.remember(gs.stats.player)
  folderPlayer.add(gs.stats.player, 'chainLength', 30, 240)
  .onChange((val) => {
    gs.notifyListener('player.chainLength', val)
  })
  folderPlayer.add(gs.stats.player, 'chainSpeed', 2, 10)
  .onChange((val) => {
    gs.notifyListener('player.chainSpeed', val)
  })
  folderPlayer.add(gs.stats.player, 'chaintoTarget')
  .onChange((val) => {
    gs.notifyListener('game.chaintoTarget', val)
  })

  folderPlayer.add(gs.stats.player, 'speed', 30, 300)
  .onChange((val) => {
    gs.notifyListener('player.speed', val)
  })

  folderPlayer.add(gs.stats.player, 'raycast')
  .onChange((val) => {
    gs.notifyListener('player.raycast', val)
  })

  folderPlayer.open()

  let folderScene = gui.addFolder('Current Scene')
  var obj = {'restart': function(){}}
  folderScene.add(obj, 'restart').onChange((val) => {
    gs.notifyListener('scene.restart', true)
  })

  folderScene.add(gs.stats.scene, 'current', [
    'bootScene',
    'splashScene',
    'madeWithScene',
    'mainMenuScene',
    'optionsScene',
    'creditsScene',
    'dungeonGameScene',
    'failGameScene',
    'missionGameScene',
    'successGameScene',
    'worldGameScene',
    'dungeonRoguelikeGameScene',
    'testLevelScene'
  ]).onChange((val) => {
    gs.notifyListener('scene.current', val)
  })
  folderScene.open()
}

if(constants.DAT_GUI_ENABLE) {
  gui = new dat.GUI({
    load: {
  "preset": "primer1",
  "remembered": {
    "Default": {
      "0": {
        "backgroundColor": "#000",
        "debug": true
      },
      "1": {
        "chainLength": 120,
        "chainSpeed": 3,
        "chaintoTarget": false,
        "speed": 150
      }
    },
    "primer1": {
      "0": {
        "backgroundColor": "#060628",
        "debug": false
      },
      "1": {
        "chainLength": 181.48371531966225,
        "chainSpeed": 6.623815267964845,
        "chaintoTarget": false,
        "speed": 159.25383422367742,
        "raycast": true
      }
    }
  },
  "closed": false,
  "folders": {
    "game": {
      "preset": "Default",
      "closed": false,
      "folders": {}
    },
    "player": {
      "preset": "Default",
      "closed": false,
      "folders": {}
    },
    "Current Scene": {
      "preset": "Default",
      "closed": false,
      "folders": {}
    }
  }
},
    preset: 'blue'
  })
  initGui()
}

let refresh = () => {
  Object.keys(gui.__folders).forEach(key => {
    let folder = gui.__folders[key]
    for (var i in folder.__controllers) {
      folder.__controllers[i].updateDisplay()
    }
  })
}

export default {gui, refresh}

