import 'phaser'

import constants from './config/constants'

import BootScene from './scenes/ui/boot'

import SplashScene from './scenes/ui/splash'
import MadeWithScene from './scenes/ui/madeWith'

import MainMenuScene from './scenes/ui/mainMenu'
import OptionsScene from './scenes/ui/options'
import CreditsScene from './scenes/ui/credits'
import TutorialScene from './scenes/ui/tutorial'

import DungeonGameScene from './scenes/game/dungeonGame'
import DungeonGameHUDScene from './scenes/game/dungeonGameHUD'
import DungeonInventoryHUDScene from './scenes/game/dungeonInventoryHUD'
import DungeonMapHUDScene from './scenes/game/dungeonMapHUD'
import FailGameScene from './scenes/game/failGame'
import MissionGameScene from './scenes/game/missionGame'
import SuccessGameScene from './scenes/game/successGame'
import WorldGameScene from './scenes/game/worldGame'
import DungeonRoguelikeGameScene from './scenes/game/dungeonRoguelikeGame'
import TestLevelScene from './scenes/game/testLevel'
import EndGameScene from './scenes/game/endGame'

import PauseScene from './scenes/ui/pause'

import getSceneManager from './managers/sceneManager'
import getDataManager from './managers/dataManager'

import gs from './config/gameStats'
import tunner from './utils/tunner'

window.game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'content',
  width: constants.WIDTH,
  height: constants.HEIGHT,
  canvas: document.getElementById('game'),
  backgroundColor: constants.BACKGROUND_COLOR,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 0},
      debug: gs.stats.game.debug
    }
  },
  resolution: constants.SCALE,
  scene: [
    BootScene,
    SplashScene,
    MadeWithScene,
    MainMenuScene,
    OptionsScene,
    CreditsScene,
    TutorialScene,
    DungeonGameScene,
    DungeonGameHUDScene,
    DungeonInventoryHUDScene,
    DungeonMapHUDScene,
    FailGameScene,
    MissionGameScene,
    SuccessGameScene,
    WorldGameScene,
    TestLevelScene,
    DungeonRoguelikeGameScene,
    PauseScene,
    EndGameScene
  ]
})

// init managers
getSceneManager(window.game.scene)
getDataManager()

document.getElementById('game').focus()
window.focus()


// how it works with game context?
if(constants.DAT_GUI_ENABLE) {
  gs.setListener('game.backgroundColor', (val) => {
    let color = Phaser.Display.Color.HexStringToColor(val)
    game.renderer.config.backgroundColor = color
  })

  gs.setListener('scene.restart', (val) => {
    gs.stats.scene.restart = false
    getSceneManager().restartScene()
  })

  gs.setListener('scene.current', (val) => {
    getSceneManager().changeToScene(val)
  })
}

document.getElementById('fullScreen').onclick = () => {
  window['game']['canvas'][game.device.fullscreen.request]()
}

document.getElementById('game').oncontextmenu = function (e) {
  e.preventDefault()
}