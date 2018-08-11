import Scene from '../scene'
import gs from '../../config/gameStats'

import Player from '../../gameObjects/player'

export default class DungeonGameScene extends Scene {
  constructor () {
    super({key: 'dungeonGameScene'})
  }
  

  create (params) {
    super.create(params)

    this.events.on('shutdown', () => {
      this.shutdown()
    }, this)
    this.player = new Player({scene: this})

    this.cameras.main.startFollow(this.player.sprite)
    
    this.sceneManager.addGameScene(this.scene.key)
    this.sceneManager.overlay('dungeonGameHUDScene')

    this.fail = this.createButton({
      x: 30,
      y: 100,
      keyText: 'fail',
      onClick: (self) => {
        this.changeToScene('failGameScene')
      }
    })

    this.success = this.createButton({
      x: 200,
      y: 100,
      keyText: 'success',
      onClick: (self) => {
        this.changeToScene('successGameScene')
      }
    })

  }

  shutdown() {
    this.events.off('shutdown')

  }

  update () {
    super.update()
    this.player.update()
  }

  updateLanguageTexts () {
    this.fail.reloadText()
    this.success.reloadText()
  }

}