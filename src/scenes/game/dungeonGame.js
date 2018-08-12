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

    this.events.on('shutdown', _ => this.shutdown(), this)
    this.events.on('pause', _ => this.pause(), this)
    this.events.on('resume', _ => this.resume(), this)
    
    
    // basic box item
    this.items = this.add.group()
    for (var i = 0; i < 20; i++) {
      this.addItem({scene: this, x: 30+Math.random()*300, y: 30+Math.random()*200, key: 'box'})
    }

    this.player = new Player({scene: this, x: 160, y: 120})
    this.player.sprite.setCollideWorldBounds(true)

    this.configPhysics()

    this.cameras.main.startFollow(this.player.sprite)
    this.cameras.main.setBounds(0, 0, 320, 240)

    this.sceneManager.addGameScene(this.scene.key)
    this.sceneManager.overlay('dungeonGameHUDScene')
  }

  success() {
    this.changeToScene('failGameScene')
  }

  fail () {
    this.changeToScene('successGameScene')
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
    item.setCollideWorldBounds(true)
    this.items.add(item)
    return item
  }

  throwItem (props) {
    props.scene = this
    let item = this.addItem(props)
    item.body.setVelocity(props.vx, props.vy)
  }

  configPhysics () {
    this.physics.add.overlap(this.player.handSprite, this.items, (hand, collider) => {
      this.player.hook(collider)
    })
    this.physics.add.overlap(this.player.sprite, this.items, (hand, collider) => {
      if (collider.grabbed) {
        this.player.collectItem(collider)
        Phaser.Utils.Array.Remove(this.items.getChildren(), collider)
        collider.destroy()
      }
    })

    this.physics.add.overlap(this.player.raycast, this.items, (ray, collider) => {
      this.player.setRaycastCollider(collider)
    })

    this.physics.add.collider(this.items, this.items)
  }
}