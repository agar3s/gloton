import Scene from '../scene'
import gs from '../../config/gameStats'

import Player from '../../gameObjects/player'
import Item from '../../gameObjects/item'

export default class DungeonGameScene extends Scene {
  constructor () {
    super({key: 'dungeonGameScene'})
  }
  

  create (params) {
    super.create(params)

    this.events.on('shutdown', () => {
      this.shutdown()
    }, this)
    this.events.on('pause', () => {
      this.pause()
    }, this)
    this.events.on('resume', () => {
      this.resume()
    }, this)
    
    this.graphics = this.add.graphics()
    this.graphics.lineStyle(2, 0x999999, 0.2)
    for (var j = 0; j < 40; j++) {
      for (var i = 0; i < 40; i++) {
        this.graphics.strokeRect(-200 + i*16, -200 + j*16, 16, 16)
      }
    }
    
    // basic box item
    this.box = new Item({scene: this, x: 250, y: 120})
    this.box2 = new Item({scene: this, x: 70, y: 120})
    this.box3 = new Item({scene: this, x: 120, y: 220})
    //staticGroup({
    //        key: 'ball',
    //    frameQuantity: 30
    //})

    this.player = new Player({scene: this, x: 160, y: 120})

    this.physics.add.overlap(this.player.handSprite, this.box.sprite, (hand, collider) => {
      this.player.hook(this.box)
    })
    this.physics.add.overlap(this.player.sprite, this.box.sprite, (hand, collider) => {
      this.player.grabItem(this.box)
    })
    this.physics.add.overlap(this.player.handSprite, this.box2.sprite, (hand, collider) => {
      this.player.hook(this.box2)
    })
    this.physics.add.overlap(this.player.sprite, this.box2.sprite, (hand, collider) => {
      this.player.grabItem(this.box2)
    })
    this.physics.add.overlap(this.player.handSprite, this.box3.sprite, (hand, collider) => {
      this.player.hook(this.box3)
    })
    this.physics.add.overlap(this.player.sprite, this.box3.sprite, (hand, collider) => {
      this.player.grabItem(this.box3)
    })
    console.log(this.box.sprite)
    console.log(this.player.handSprite)

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
    this.fail.setVisible(false)

    this.success = this.createButton({
      x: 200,
      y: 100,
      keyText: 'success',
      onClick: (self) => {
        this.changeToScene('successGameScene')
      }
    })
    this.success.setVisible(false)

  }

  shutdown() {
    console.log('destroy the player....')
    this.events.off('shutdown')
    this.player.destroy()
  }

  pause () {
    this.physics.pause()
    this.player.pause()
  }
  resume () {
    this.physics.resume()
  }

  update () {
    super.update()
    this.player.update()

    //this.physics.world.collide(this.player.handSprite, this.box.sprite)
  }

  updateLanguageTexts () {
    this.fail.reloadText()
    this.success.reloadText()
  }

}