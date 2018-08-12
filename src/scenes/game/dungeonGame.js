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
    this.items = this.add.group()
    for (var i = 0; i < 1; i++) {
      this.addItem({scene: this, x: 30+Math.random()*300, y: 30+Math.random()*200, key: 'box'})
    }

    this.player = new Player({scene: this, x: 160, y: 120})

    this.physics.add.overlap(this.player.handSprite, this.items, (hand, collider) => {
      if(this.player.hand.going){
        collider.grab()
        this.player.hook(collider)
      }
    })
    this.physics.add.overlap(this.player.sprite, this.items, (hand, collider) => {
      if(collider.grabbed){
        this.player.grabItem(collider)
        collider.destroy()
        Phaser.Utils.Array.Remove(this.items.getChildren(), collider)

        this.addItem({scene: this, x: 30+Math.random()*300, y: 30+Math.random()*200, key: 'box'})
        this.addItem({scene: this, x: 30+Math.random()*300, y: 30+Math.random()*200, key: 'box'})
      }
    })

    this.physics.add.collider(this.items, this.items)


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
  }

  updateLanguageTexts () {
    this.fail.reloadText()
    this.success.reloadText()
  }

  addItem (props) {
    let item = new Item(props)
    this.add.displayList.add(item)
    this.add.updateList.add(item)
    this.physics.add.world.enableBody(item, Phaser.Physics.Arcade.DYNAMIC_BODY)
    item.setProperties()
    this.items.add(item)
  }
}