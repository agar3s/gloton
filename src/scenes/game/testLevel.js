import Scene from '../scene'
import gs from '../../config/gameStats'

import Player from '../../gameObjects/player'

export default class TestLevelScene extends Scene {
  constructor() {
    super({ key: 'testLevelScene' })
  }

  create(params) {
    super.create(params)

    // setup event listeners
    this.events.on(
      'shutdown',
      () => {
        this.shutdown()
      },
      this
    )
    this.events.on(
      'pause',
      () => {
        this.pause()
      },
      this
    )
    this.events.on(
      'resume',
      () => {
        this.resume()
      },
      this
    )

    // ┌ setup the Test Level ─────────────────────────────────────────────────┐
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
    // └───────────────────────────────────────────────────────────────────────┘

    // ┌ create the door ──────────────────────────────────────────────────────┐
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
      frameRate: 12,
      repeat: 0
    })

    // └───────────────────────────────────────────────────────────────────────┘

    // ┌ create the PC ────────────────────────────────────────────────────────┐
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
    
    // enable collisions between the player and the walls
    this.physics.add.collider(this.player.sprite, this.wallsLayer)

    // handle the event of the PC colliding with the door
    this.physics.add.collider(this.player.sprite, this.door, (playerSprite, door) => {
      door.anims.play('door-open')
      playerSprite.anims.play('pc-openning')
    }, null, this)
    
    // ├── setup the animations for the PC ─┐
    // anims: https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Components.Animation.html
    // AnimationConfig: https://photonstorm.github.io/phaser3-docs/global.html#AnimationConfig
    this.anims.create({
      key: 'pc-idle',
      frames: this.generateFrameNames('characters/pc', 'idle'),
      frameRate: 1,
      repeat: -1
    })
    this.anims.create({
      key: 'pc-openning',
      frames: this.generateFrameNames('characters/pc', 'openning', 1),
      frameRate: 1,
      repeat: 1
    })
    
    this.player.sprite.anims.play('pc-idle')
    // └───────────────────────────────────┘
    
    // set the bounds for the camera and make it follow the player
    this.cameras.main.startFollow(this.player.sprite)
    // this.cameras.main.setBounds(0, 0, 320, 240)
    
    // add this scene to the list of "pausable" scenes
    this.sceneManager.addGameScene(this.scene.key)
    // └───────────────────────────────────────────────────────────────────────┘
  }
  
  update() {
    super.update()
    this.player.update()
  }

  shutdown() {
    this.events.off('shutdown')
    this.player.destroy()
  }

  pause() {
    this.player.pause()
  }

  resume() {
    this.physics.resume()
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
