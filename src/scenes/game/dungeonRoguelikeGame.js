import Scene from '../scene'
import gs from '../../config/gameStats'
import constants from '../../config/constants'

import Player from '../../gameObjects/player'
import Item from '../../gameObjects/item'
import Enemy from '../../gameObjects/enemy'

import Dungeon from '@mikewesthad/dungeon'
import TilemapVisibility from '../../utils/tilemap-visibility.js'
import TILES from '../../config/tileMapping'

import generateItem from '../../config/itemGenerator'

export default class DungeonRoguelikeGameScene extends Scene {
  constructor () {
    super({key: 'dungeonRoguelikeGameScene'})
  }
  

  create (params) {
    super.create(params)

    // lo del dungeon
    this.items = this.add.group()
    this.doors = this.add.group()

    this.setupDungeon()

    this.events.on('shutdown', _ => this.shutdown(), this)
    this.events.on('pause', _ => this.pause(), this)
    this.events.on('resume', _ => this.resume(), this)
    //this.setupPlayer()
    this.player.sprite.setDepth(5)
    this.player.handSprite.setDepth(6)
    this.player.cursor.setDepth(20)

    // add an enemy
    this.enemies = []
    this.addEnemy({x:this.player.sprite.x + 50, y:this.player.sprite.y})
    this.addEnemy({x:this.player.sprite.x - 50, y:this.player.sprite.y})
    this.addEnemy({x:this.player.sprite.x, y:this.player.sprite.y + 50})
    this.addEnemy({x:this.player.sprite.x, y:this.player.sprite.y - 50})

    this.setupPhysics()
/*
    this.setupLevel()
    this.door.setDepth(4)
*/
    this.sceneManager.addGameScene(this.scene.key)
    this.sceneManager.overlay('dungeonGameHUDScene')



    //DEBUG

    // const debugGraphics = this.add.graphics().setAlpha(0.75);
    // this.wallsLayer.renderDebug(debugGraphics, {
    //   tileColor: null, // Color of non-colliding tiles
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    // });

    //start timer

    this.timer = this.time.addEvent({ delay: 3*60000, loop: false})
    this.music = this.sound.add('mx_main')
    this.music.volume = 0.2
    this.music.play({
      loop:-1
    })

  }

  setupDungeon () {
    let start = +(new Date())
    // setup a new dungeon
    this.dungeon = new Dungeon({
      width: 80,
      height: 80,
      doorPadding: 6,
      rooms: {
        width: { min: 16, max: 32},
        height: { min: 16, max: 32}
      }
    })

    const map = this.make.tilemap({
      tileWidth: 16,
      tileHeight: 16,
      width: this.dungeon.width,
      height: this.dungeon.height
    })

    const tileset = map.addTilesetImage('maze01', 'tilesMaze01')
    this.groundLayer = map.createBlankDynamicLayer('ground', tileset).fill(299)
    this.wallsLayer = map.createBlankDynamicLayer('walls', tileset)
    this.foregroundLayer = map.createBlankDynamicLayer('foreground', tileset)
    const shadowLayer = map.createBlankDynamicLayer('shadow', tileset).fill(299)
    this.foregroundLayer.setDepth(25)
    shadowLayer.setDepth(30)
    this.tilemapVisibility = new TilemapVisibility(shadowLayer)
    // shadow - READY 

    
    // dungeon reader
    // Use the array of rooms generated to place tiles in the map
    // Note: using an arrow function here so that "this" still refers to our scene
    this.dungeon.rooms.forEach(room => {
      const { x, y, width, height, left, right, top, bottom } = room;

      // Fill the floor with mostly clean tiles, but occasionally place a dirty tile
      // See "Weighted Randomize" example for more information on how to use weightedRandomize.
      this.groundLayer.weightedRandomize(x + 2, y + 3, width - 4, height - 6, TILES.FLOOR)

      // top walls
      let paddingTop = 1
      let paddingBottom = 3
      this.wallsLayer.weightedRandomize(left + 2, top + paddingTop, width - 4, 1, TILES.WALL.TOP)
      this.wallsLayer.weightedRandomize(left + 2, top + paddingTop + 1, width - 4, 1, [{index: 42, weight: 1}])
      this.wallsLayer.weightedRandomize(left + 2, top + paddingTop + 2, width - 4, 1, [{index: 62, weight: 1}])

      // right walls
      this.wallsLayer.weightedRandomize(right-1, top + 1+paddingTop, 1, height - 2-paddingTop-paddingBottom, TILES.WALL.RIGHT)
      this.wallsLayer.putTilesAt([[103],[123],[143]], right - 1, bottom - paddingBottom-1)
      this.wallsLayer.putTilesAt([[3]], right - 1, top+paddingTop)

      // left walls
      this.wallsLayer.weightedRandomize(left + 1, top + 1+paddingTop, 1, height - 2-paddingTop-paddingBottom, TILES.WALL.LEFT)
      this.wallsLayer.putTilesAt([[100],[120],[140]], left + 1, bottom - 1-paddingBottom)
      this.wallsLayer.putTilesAt([[0]], left + 1, top+paddingTop)

      // bottom walls
      this.wallsLayer.weightedRandomize(left + 2, bottom-paddingBottom, width - 4, 1, TILES.WALL.BOTTOM)
      this.wallsLayer.weightedRandomize(left + 2, bottom-paddingBottom+1, width - 4, 1, [{index: 141, weight: 1}])
      this.foregroundLayer.weightedRandomize(left + 2, bottom-1-paddingBottom, width - 4, 1, [{index: 102, weight: 1}, {index: 101, weight: 1}])


      // Dungeons have rooms that are connected with doors. Each door has an x & y relative to the
      // room's location
      var doors = room.getDoorLocations()
      for (var i = 0; i < doors.length; i++) {
        if (doors[i].y === 0) { // DOOR AT THE TOP
          // remove wall
          this.wallsLayer.putTilesAt([[21,21],[21,21],[21,21]], x + doors[i].x - 1, y + doors[i].y + paddingTop)
          // put floor
          this.groundLayer.putTilesAt([[39,39],[39,39],[39,39],[39,39]], x + doors[i].x - 1, y + doors[i].y)
          //put superior left border
          this.wallsLayer.putTilesAt([[20],[102]], x + doors[i].x - 2, y + doors[i].y)
          //put superior right border
          this.wallsLayer.putTilesAt([[23],[81],[41] ,[61]], x + doors[i].x + 1, y + doors[i].y)

          this.addDoor((x+doors[i].x-1)*16, (y+doors[i].y)*16, 'top')
        } else if (doors[i].y === room.height - 1) { // DOOR at the bottom
          // remove wall
          this.wallsLayer.putTilesAt([[21,21],[21,21],[21,21]], x + doors[i].x - 1, y + doors[i].y-paddingBottom)
          this.foregroundLayer.putTilesAt([[21,21]], x + doors[i].x - 1, y + doors[i].y-1-paddingBottom)
          // put floor
          this.groundLayer.putTilesAt([[39,39],[39,39],[39,39]], x + doors[i].x - 1, y + doors[i].y-paddingBottom+1)
          // put inferior right border
          this.foregroundLayer.putTilesAt([[24]], x + doors[i].x + 1, y + doors[i].y-1-paddingBottom)
          this.wallsLayer.putTilesAt([[44],[124],[43],[43]], x + doors[i].x + 1, y + doors[i].y-paddingBottom)
          // put inferior left border
          this.foregroundLayer.putTilesAt([[25]], x + doors[i].x - 2, y + doors[i].y-1-paddingBottom)
          this.wallsLayer.putTilesAt([[45],[125],[40],[40]], x + doors[i].x - 2, y + doors[i].y-paddingBottom)

          this.addDoor((x+doors[i].x-1)*16, (y+doors[i].y-3)*16, 'bottom')

        } else if (doors[i].x === 0) { // DOOR AT THE LEFT
          // remove wall
          this.wallsLayer.putTilesAt([[21],[21]], x + doors[i].x+1, y + doors[i].y - 1)
          // put tiles
          //this.groundLayer.putTilesAt([[39,39],[39,39]], x + doors[i].x+1, y + doors[i].y - 1)
          // ???? funciona?
          this.groundLayer.putTilesAt([[39,39],[39,39]], x + doors[i].x, y + doors[i].y - 1)

          // put superior border in the wall
          this.wallsLayer.putTilesAt([[102],[42],[62]], x + doors[i].x+1, y + doors[i].y - 4)
          this.wallsLayer.putTilesAt([[102],[42],[62]], x + doors[i].x, y + doors[i].y - 4)
          // put inferior border in the wall
          this.wallsLayer.putTilesAt([[45],[125]], x + doors[i].x+1, y + doors[i].y + 1)
          this.wallsLayer.putTilesAt([[121],[141]], x + doors[i].x, y + doors[i].y + 1)
          this.foregroundLayer.putTilesAt([[25]], x + doors[i].x+1, y + doors[i].y)
          this.foregroundLayer.putTilesAt([[102]], x + doors[i].x, y + doors[i].y)

          this.addDoor((x+doors[i].x)*16, (y+doors[i].y-3)*16+3, 'left')
        } else if (doors[i].x === room.width - 1) { // DOOR AT THE RIGHT
          // remove wall
          this.wallsLayer.putTilesAt([[21],[21]], x + doors[i].x-1, y + doors[i].y - 1)
          // put tiles
          this.groundLayer.putTilesAt([[39],[39]], x + doors[i].x-1, y + doors[i].y - 1)
          this.groundLayer.putTilesAt([[39],[39]], x + doors[i].x, y + doors[i].y - 1)
          
          // put superior border in the wall
          this.wallsLayer.putTilesAt([[81],[41],[61]], x + doors[i].x-1, y + doors[i].y - 4)
          this.wallsLayer.putTilesAt([[102],[42],[62]], x + doors[i].x, y + doors[i].y - 4)
          // put inferior border in the wall
          this.wallsLayer.putTilesAt([[44],[124]], x + doors[i].x-1, y + doors[i].y + 1)
          this.wallsLayer.putTilesAt([[121],[141]], x + doors[i].x, y + doors[i].y + 1)
          this.foregroundLayer.putTilesAt([[24]], x + doors[i].x-1, y + doors[i].y)
          this.foregroundLayer.putTilesAt([[102]], x + doors[i].x, y + doors[i].y)

          this.addDoor((x+doors[i].x)*16, (y+doors[i].y)*16, 'right')

        }
      }
    })


    // arribapendiente lo del espacio

    // Separate out the rooms into:
    //  - The starting room (index = 0)
    //  - A random room to be designated as the end room (with stairs and nothing else)
    //  - An array of 90% of the remaining rooms, for placing random stuff (leaving 10% empty)
    const rooms = this.dungeon.rooms.slice()
    const startRoom = rooms.shift()
    const endRoom = Phaser.Utils.Array.RemoveRandomElement(rooms)
    const otherRooms = Phaser.Utils.Array.Shuffle(rooms).slice(0, rooms.length * 0.9)

    // Place the stairs
    this.foregroundLayer.putTileAt(TILES.STAIRS, endRoom.centerX, endRoom.centerY)

    // Place stuff in the 90% "otherRooms"
    otherRooms.forEach(room => {
      /*this.foregroundLayer.weightedRandomize(x, y, 1, 1, TILES.POT)*/
      const x1 = room.left + 2
      const x2 = room.right - 2
      const y1 = room.top + 5
      const y2 = room.bottom - 4
      var rand = Math.random()
      if(rand<0.2){
        this.createItemsIn(1, x1, x2, y1, y2)
      }else if(rand<0.5){
        this.createItemsIn(3, x1, x2, y1, y2)
      }else if(rand<0.75){
        this.createItemsIn(5, x1, x2, y1, y2)
      }else {
        this.createItemsIn(7, x1, x2, y1, y2)
      }
    })  
      
      // colision para el fin del nivel
      // Not exactly correct for the tileset since there are more possible floor tiles, but this will
      // do for the example.

    this.foregroundLayer.setTileIndexCallback(TILES.STAIRS, () => {
      this.foregroundLayer.setTileIndexCallback(TILES.STAIRS, null)
      this.hasPlayerReachedStairs = true
      this.player.sprite.freeze()
      const cam = this.cameras.main
      cam.fade(250, 0, 0, 0)
      cam.once("camerafadeoutcomplete", () => {
        this.player.destroy()
        this.scene.restart()
      })
    })

    // starts the player?
    // Place the player in the first room
    const playerRoom = startRoom
    const x = map.tileToWorldX(playerRoom.centerX)
    const y = map.tileToWorldY(playerRoom.centerY)
    this.setupPlayer(x, y)
    //this.player = new Player(this, x, y)

    // Watch the player and tilemap layers for collisions, for the duration of the scene:
//      this.physics.add.collider(this.player.sprite, this.groundLayer)
//      this.physics.add.collider(this.player.sprite, this.stuffLayer)

    // Phaser supports multiple cameras, but you can access the default camera like this:
    const camera = this.cameras.main

    // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
    //camera.startFollow(this.player.sprite)

    this.wallsLayer.setCollisionByExclusion([-1, 21])
    /*this.wallsLayer.setCollisionByProperty({
      collides: true
    })*/

    let allDoors = this.doors.getChildren()
    for(var i=0;i<allDoors.length-1;i++){
      let doorA = allDoors[i]
      if(doorA.twinDoor) continue
      let min = 5000
      let pairedIndex = -1
      for(var j = i+1;j<allDoors.length;j++){
        let doorB = allDoors[j]
        if(doorB.twinDoor) continue
        let distance = Phaser.Math.Distance.Between(doorA.x, doorA.y, doorB.x, doorB.y)
        if(distance<min){
          min = distance
          pairedIndex = j
        }
      }
      doorA.twinDoor = allDoors[pairedIndex]
      allDoors[pairedIndex].twinDoor = doorA
    }
  }

  hitPlayer(enemy){
    let distance = Phaser.Math.Distance.Between(enemy.x, enemy.y-enemy.height/2, this.player.sprite.x, this.player.sprite.y-this.player.sprite.height/2) 
    if(distance<18) {
      this.player.getHit()
    }else {
      
    }
  }

  createItemsIn(howMany, x1, x2, y1, y2) {
    for (var i = 0; i < howMany; i++) {
      var rand = Math.random()
      const x = Phaser.Math.Between(x1, x2)
      const y = Phaser.Math.Between(y1, y2)

      let item = generateItem()
      this.addItem({
        scene:this,
        key: constants.ATLAS_KEY,
        frame: `items/${item.type}`,
        x:x*16,
        y:y*16,
        props:item
      })
    }
  }


  addDoor(x, y, position) {
    let spriteKey = {
      'top': 'mazes/maze01/door-closed-001',
      'bottom': 'mazes/maze01/door_back-closed-001',
      'left': 'mazes/maze01/door_side_left-closed-001',
      'right': 'mazes/maze01/door_side-closed-001'
    }

    let door = this.physics.add.sprite(
      x, y,
      this.constants.ATLAS_KEY,
      spriteKey[position]
    )
    if(position === 'bottom'){
      door.setSize(door.width, 48).setOffset(0, 12)
      door.setDepth(25)
    }else if(position === 'left' || position==='right'){
      door.setOffset(0, 16)
    }else {
      door.setSize(door.width, 46)
    }


    // the door can't be moved by the player
    door.body.immovable = true
    door.position = position

    // ├── setup the animations for the PC ─┐
    // anims: https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Components.Animation.html
    // AnimationConfig: https://photonstorm.github.io/phaser3-docs/global.html#AnimationConfig
    if(!this.anims.anims.get('door-open')){
      this.anims.create({
        key: 'door-open',
        frames: this.generateFrameNames('mazes/maze01', 'door-open', 20),
        repeat: 0
      })
      const doorAnimationMs = [60,60,60,60,60,60,60,60,60,60,150,60,250,60,60,60,120,120,120,120]
      this.anims.anims.get('door-open').frames.forEach((frame, index)=>{
        frame.duration = doorAnimationMs[index]
      })

      this.anims.create({
        key: 'door_side-open',
        frames: this.generateFrameNames('mazes/maze01', 'door_side-open', 20),
        repeat: 0
      })
      this.anims.anims.get('door_side-open').frames.forEach((frame, index)=>{
        frame.duration = doorAnimationMs[index]
      })

      this.anims.create({
        key: 'door_side_left-open',
        frames: this.generateFrameNames('mazes/maze01', 'door_side_left-open', 20),
        repeat: 0
      })
      this.anims.anims.get('door_side_left-open').frames.forEach((frame, index)=>{
        frame.duration = doorAnimationMs[index]
      })

      this.anims.create({
        key: 'door_back-open',
        frames: this.generateFrameNames('mazes/maze01', 'door_back-open', 20),
        repeat: 0
      })
      this.anims.anims.get('door_back-open').frames.forEach((frame, index)=>{
        frame.duration = doorAnimationMs[index]
      })
    }




    this.doors.add(door)
  }

  setupPlayer (x, y) {
    /*const spawnPoint = this.map.findObject(
      'Objects',
      obj => obj.name === 'Spawn Point'
    )*/
    this.player = new Player({
      scene: this,
      x: x,
      y: y,
      key: this.constants.ATLAS_KEY,
      frame: 'characters/pc/idle-001'
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
    this.events.off('shutdown')
    this.player.destroy()
    this.music.stop()
    this.music.destroy()
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

    const playerTileX = this.groundLayer.worldToTileX(this.player.sprite.x)
    const playerTileY = this.groundLayer.worldToTileY(this.player.sprite.y-this.player.sprite.height/2)
    const playerRoom = this.dungeon.getRoomAt(playerTileX, playerTileY)

    this.tilemapVisibility.setActiveRoom(playerRoom)

    let t = ~~(this.timer.getElapsedSeconds())
    this.registry.set('timer', t)

    // update enemies
    this.enemies.forEach(enemy => enemy.update(this.player.sprite))
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

  addEnemy (props) {
    props.scene = this
    props.key =  this.constants.ATLAS_KEY
    props.frame = 'characters/pc/skeleton-idle-001'
    props.props = {}
    
    let enemy = new Enemy(props)
    this.add.displayList.add(enemy)
    this.add.updateList.add(enemy)
    this.physics.add.world.enableBody(enemy, Phaser.Physics.Arcade.DYNAMIC_BODY)
    enemy.setProperties()
    this.items.add(enemy)
    
    this.enemies.push(enemy)
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
    this.physics.add.overlap(this.player.sprite, this.items, (playerSprite, collider) => {
      if (collider.grabbed) {

        this.player.collectItem(collider)
        Phaser.Utils.Array.Remove(this.items.getChildren(), collider)
        let index = this.enemies.indexOf(collider)
        this.enemies.splice(index, 1)
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
      if(wall.collides) {
        this.player.hookCollidesWall(wall)
      }
    })
    // handle the event of the PC colliding with the door
    this.physics.add.collider(this.player.sprite, this.doors, (playerSprite, door) => {
      if(door.opening) return
      let animations = {
        'top': 'door-open',
        'bottom': 'door_back-open',
        'left': 'door_side_left-open',
        'right': 'door_side-open'
      }
      door.opening = true
      door.anims.play(animations[door.position])

      this.player.openDoor(door)
      door.twinDoor.destroy()
      
      door.on('animationcomplete', (animation, frame) => {
        this.player.finishOpenDoor()
        door.destroy()
      }, this)
    }, null, this)
    this.physics.add.collider(this.items, this.doors)
    this.physics.add.overlap(this.player.handSprite, this.doors, (hand, door)=>{
      
        this.player.hookCollidesWall(door)
    
    })
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