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

    this.setupLevel()
    this.setupPlayer()
        
    // basic box item
    this.items = this.add.group()
    for (var i = 0; i < 20; i++) {
      this.addItem({scene: this, x: 30+Math.random()*300, y: 30+Math.random()*200, key: 'box'})
    }

    this.setupPhysics()

    this.sceneManager.addGameScene(this.scene.key)
    this.sceneManager.overlay('dungeonGameHUDScene')
  }

  setupLevel() {
    this.map = this.make.tilemap({
      key: 'mapMaze01',
      tileWidth: this.constants.TILE_SIZE,
      tileHeight: this.constants.TILE_SIZE
    })

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = this.map.addTilesetImage('maze01', 'tilesMaze01')

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    this.backgroundLayer = this.map.createStaticLayer('background', tileset)
    this.groundLayer = this.map.createStaticLayer('ground', tileset)
    this.wallsLayer = this.map.createStaticLayer('walls', tileset)

    this.wallsLayer.setCollisionByProperty({
      collides: true
    })


    // doors
    this.addDoor()
  }

  addDoor() {
    const doorPoint = this.map.findObject(
      'Objects',
      obj => obj.name === 'Door'
    )

    this.door = this.physics.add.sprite(
      doorPoint.x,
      doorPoint.y,
      this.constants.ATLAS_KEY,
      'mazes/maze01/door-closed-001'
    );

    // the door can't be moved by the player
    this.door.body.immovable = true;

    // ├── setup the animations for the PC ─┐
    // anims: https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Components.Animation.html
    // AnimationConfig: https://photonstorm.github.io/phaser3-docs/global.html#AnimationConfig
    this.anims.create({
      key: 'door-open',
      frames: this.generateFrameNames('mazes/maze01', 'door-open', 20),
      repeat: 0
    })

    const doorAnimationMs = [60,60,60,60,60,60,60,60,60,60,150,60,250,60,60,60,120,120,120,120]
    this.anims.anims.get('door-open').frames.forEach((frame, index)=>{
      frame.duration = doorAnimationMs[index]
    })
  }

  setupPlayer () {
    const spawnPoint = this.map.findObject(
      'Objects',
      obj => obj.name === 'Spawn Point'
    )
    this.player = new Player({
      scene: this,
      x: spawnPoint.x,
      y: spawnPoint.y,
      textureKey: this.constants.ATLAS_KEY,
      textureFrame: 'characters/pc/idle-001'
    })


    //this.player.sprite.setCollideWorldBounds(true)
    this.cameras.main.startFollow(this.player.sprite)
    //this.cameras.main.setBounds(0, 0, 320, 240)
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
    this.items.add(item)
    return item
  }

  throwItem (props) {
    props.scene = this
    let item = this.addItem(props)
    item.body.setVelocity(props.vx, props.vy)
  }

  setupPhysics () {
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

    this.physics.add.collider(this.items, this.wallsLayer)
    this.physics.add.collider(this.player.sprite, this.wallsLayer)
    this.physics.add.overlap(this.player.handSprite, this.wallsLayer, (hand, wall) => {
      if(wall.collides) this.player.hookCollidesWall(wall)
    })
    // handle the event of the PC colliding with the door
    this.physics.add.collider(this.player.sprite, this.door, (playerSprite, door) => {
      if(door.opening) return
      door.opening = true
      door.anims.play('door-open')
      playerSprite.anims.play('pc-openning')
      door.on('animationcomplete', (animation, frame) => {
        playerSprite.anims.play('pc-idle')
        this.door.destroy()
      }, this)

    }, null, this)
  }

  generateFrameNames(path, animationId, end) {
    return this.anims.generateFrameNames(this.constants.ATLAS_KEY, {
      start: 1,
      end: end || 2,
      zeroPad: 3,
      prefix: `${path}/${animationId}-`
    })
  }
}