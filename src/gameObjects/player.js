import gs from '../config/gameStats'
import generateItem from '../config/itemGenerator'
import constants from '../config/constants'

const STATUS = {
  IDLE: 0,
  RUNNING: 1,
  OPENING: 2,
  HAND: 3,
  HIT: 4
}

export default class Player {
  constructor(params) {
    this.scene = params.scene


    const { S, W, A, D } = Phaser.Input.Keyboard.KeyCodes;
    this.keys = this.scene.input.keyboard.addKeys({
      s: S,
      w: W,
      a: A,
      d: D
    })

    this.sprite = this.scene.physics.add.sprite(
      params.x,
      params.y,
      params.key,
      params.frame
    )

    this.sprite.setBounce(0, 0)
    this.status = STATUS.IDLE

    // ├── setup the animations for the PC ─┐
    // anims: https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Components.Animation.html
    // AnimationConfig: https://photonstorm.github.io/phaser3-docs/global.html#AnimationConfig
    this.scene.anims.create({
      key: 'pc-idle',
      frames: [{
        key: 'mochilaAtlas',
        frame: 'characters/pc/idle-001',
        duration: 2500
      }, {
        key: 'mochilaAtlas',
        frame: 'characters/pc/idle-002',
        duration: 800
      }],
      repeat: -1
    })
    this.scene.anims.create({
      key: 'pc-openning',
      frames: this.scene.generateFrameNames('characters/pc', 'openning', 1),
      frameRate: 1,
      repeat: 1
    })

    this.scene.anims.create({
      key: 'pc-run',
      frames: this.scene.generateFrameNames('characters/pc', 'run', 2),
      frameRate: 10,
      repeat: -1
    })

    this.scene.anims.create({
      key: 'pc-show_phone',
      frames: this.scene.generateFrameNames('characters/pc', 'show_phone', 2),
      frameRate: 10,
      repeat: 0
    })

    this.scene.anims.create({
      key: 'pc-hit',
      frames: this.scene.generateFrameNames('characters/pc', 'hit', 3),
      frameRate: 10,
      repeat: 0
    })
    
    this.sprite.anims.play('pc-idle')
    this.sprite.setSize(this.sprite.width, 12).setOffset(0, this.sprite.height-12)
    // player's foot
    //this.foot = this.scene.add.zone(params.x-this.sprite.width/2, params.y-10).setSize(this.sprite.width, 10)
    //this.scene.physics.world.enable(this.foot)

    // defines the raycast
    this.raycast = this.scene.add.zone(params.x, params.y).setSize(5, 5)
    this.scene.physics.world.enable(this.raycast)
    this.raycast.body.setAllowGravity(false)
    this.raycast.body.moves = true

    this.cursor = this.scene.add
      .sprite(params.x, params.y, 'cursor')

    this.handSprite = this.scene.physics.add
      .sprite(params.x, params.y-20, 'hand')

    this.mousePointer = this.scene.input.mouse.manager.activePointer

    this.scene.input.on('pointerdown', pointer => {
    })

    setTimeout(()=>{
      this.scene.input.on('pointerup', pointer => {
        this.handleClick(pointer)
      })
    },500)

    this.debugGraphic = this.scene.add.graphics()

    this.graphics = this.scene.add.graphics()

    this.resetKeys()

    // properties
    this.hand = {
      locked: false,
      lenght: 0,
      going: false
    }

    this.sounds = {
      hook_shot: this.scene.sound.add('fx_hook_shot_01'),
      hook_return: this.scene.sound.add('fx_hook_return_01'),
      
      impact_fail_01: this.scene.sound.add('fx_impact_fail_01'),
      impact_fail_02: this.scene.sound.add('fx_impact_fail_02'),

      impact_skeleton_01: this.scene.sound.add('fx_impact_skeleton_01'),
      impact_skeleton_02: this.scene.sound.add('fx_impact_skeleton_02'),

      impact_stone_01: this.scene.sound.add('fx_impact_stone_01'),
      impact_stone_02: this.scene.sound.add('fx_impact_stone_02'),

      impact_metal_01: this.scene.sound.add('fx_impact_metal_01'),
      impact_metal_02: this.scene.sound.add('fx_impact_metal_02'),

      impact_crystal_01: this.scene.sound.add('fx_impact_crystal_01'),
      impact_crystal_02: this.scene.sound.add('fx_impact_crystal_02'),

      impact_wood_01: this.scene.sound.add('fx_impact_wood_01'),
      impact_wood_02: this.scene.sound.add('fx_impact_wood_02'),

      ninja_fs: this.scene.sound.add('fx_ninja_FS'),
      ninja_hurt: this.scene.sound.add('fx_ninja_hurt'),
      ninja_shot: this.scene.sound.add('fx_ninja_shot'),
      ninja_empty: this.scene.sound.add('fx_ninja_empty'),
      ninja_store: this.scene.sound.add('fx_ninja_store'),
      door_open: this.scene.sound.add('fx_door_open'),
    }
    Object.keys(this.sounds).forEach(key=>{
      this.sounds[key].volume = 0.4
    })
    this.sounds.ninja_fs.volume = 0.9

    // random objects in inventory by default
    gs.stats.inventory.items = []
    // for testing
    /*for (var i = 0; i < 50; i++) {
      let itemprops = generateItem()
      gs.stats.inventory.items.push(itemprops)
    }*/
    gs.stats.player.life = 3
  }

  handleClick(pointer) {
    if(gs.stats.hud.inventoryOpen || gs.stats.hud.mapOpen) return
    if(pointer.buttons==1)this.launch()
    if(pointer.buttons==2)this.expulse()
  }

  update () {
    let prevVelocity = this.sprite.body.velocity.clone()
    // get input from player
    let y = this.keys.w.isDown?-1:this.keys.s.isDown?1:0
    let x = this.keys.a.isDown?-1:this.keys.d.isDown?1:0
    let speed = gs.stats.player.speed * (this.hookedItem?0.7:1)
    if(this.status == STATUS.OPENING) speed = 0

    if(x==-1){
      this.sprite.flipX = true
    }else if(x==1){
      this.sprite.flipX = false
    }
    if(x==0&&y==0){
      if (this.status !== STATUS.IDLE && (prevVelocity.y != 0 || prevVelocity.x != 0)) {
        this.setStatus(STATUS.IDLE)
        
      }
    }else{
      if (this.status === STATUS.IDLE && prevVelocity.y == 0 && prevVelocity.x == 0) {
        this.setStatus(STATUS.RUNNING)
      }
    }

    
    this.sprite.body.setVelocity(0)
    this.sprite.body.setVelocity(x*speed, y*speed)
    this.sprite.body.velocity.normalize().scale(speed)
    //this.foot.body.setVelocity(this.sprite.body.velocity.x, this.sprite.body.velocity.y)
    

    this.anchorHand = {
      x: this.sprite.x + 0,
      y: this.sprite.y - 8
    }
    // update cursor's position
    let angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y - this.sprite.height/2, this.cursor.x, this.cursor.y)
    if(!this.hand.locked) {
      this.cursor.x = this.mousePointer.x + this.scene.cameras.main._scrollX
      this.cursor.y = this.mousePointer.y + this.scene.cameras.main._scrollY

      this.handSprite.x = this.anchorHand.x
      this.handSprite.y = this.anchorHand.y

      if(gs.stats.player.raycast){
        this.updateRaycast(angle)
      }
    } else {
      angle = this.updateHand(angle)
      this.drawHand()
    }

    this.handSprite.rotation = angle
    // draw the ray
    if(gs.stats.game.debug) {
      this.drawDebug(angle)
    }
    // load gui
    if(constants.DAT_GUI_ENABLE) {     
      gs.setListener('game.debug', (val) => {
        this.debugGraphic.clear()
        this.scene.physics.world.debugGraphic.clear()
        this.scene.physics.world.drawDebug = val
      })
    }

  }

  launch () {
    if(this.hand.locked) return
    this.sounds.hook_shot.play()
    // lock the hand/cursor
    this.hand.locked = true
    this.hand.length = 0
    this.hand.going = true

    if(gs.stats.player.raycast){
      this.resetRayCast()
    }

    // draw a ray in direction to the cursor
    // check for collision in the trayectory
    // 
  }

  expulse () {
    // o si?
    if(this.hand.locked) return
    let inventory = gs.stats.inventory.items
    if (inventory.length==0) {
      this.sounds.ninja_empty.play()
      return
    }
    this.sounds.ninja_shot.play()
    let index = ~~(Math.random()*inventory.length)
    let itemprops = (inventory.splice(index, 1))[0]

    this.scene.throwItem({
      x: this.anchorHand.x,
      y: this.anchorHand.y,
      key: constants.ATLAS_KEY,
      frame: `items/${itemprops.type}`,
      vx: Math.cos(this.handSprite.rotation)*500,
      vy: Math.sin(this.handSprite.rotation)*500,
      props: itemprops
    })

    let rawItem = JSON.parse(JSON.stringify(itemprops))
    //check if that was one one of the goals
    for (var i = 0; i < gs.stats.game.targetItems.length; i++) {
      let target = gs.stats.game.targetItems[i]
      if(target.typeKey===rawItem.typeKey && target.special === rawItem.special){
        target.collectedByType--
      }
    }
  }

  resetKeys() {
    Object.keys(this.keys).forEach(keyName => {
      this.keys[keyName].reset()
    })
  }

  pause () {
    // reset keys to avoid sticky events.
    this.resetKeys()
  }

  destroy() {
    this.sprite.destroy()
    this.cursor.destroy()
    this.stopFx()
  }

  stopFx() {
    Object.keys(this.sounds).forEach(key=>{
      this.sounds[key].stop()
    })
  }

  updateHand (angle) {

    if(this.hand.going) {
      return this.updatePushingHand(angle)
    } else {
      return this.updatePullingHand(angle)
    }

  }

  updatePushingHand (angle) {
    this.hand.length += gs.stats.player.chainSpeed*(this.hand.going?1:-1)
    this.handSprite.x = (Math.cos(angle))*this.hand.length + this.anchorHand.x
    this.handSprite.y = (Math.sin(angle))*this.hand.length + this.anchorHand.y

    let distanceToTarget = Phaser.Math.Distance.Squared(this.anchorHand.x, this.anchorHand.y, this.cursor.x, this.cursor.y)
    if(gs.stats.player.chaintoTarget && (this.hand.length*this.hand.length >= distanceToTarget)) {
      this.hand.going = false
    }else if(this.hand.length > gs.stats.player.chainLength) {
      this.hand.length = gs.stats.player.chainLength
      this.hand.going = false
      // llego al limit
      this.sounds.hook_shot.stop()
      
    }
    return angle
  }
  
  updatePullingHand (angle) {
    if(this.hookedItem) {
      angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, this.hookedItem.x, this.hookedItem.y)
      
      this.hookedItem.body.setVelocityX(Math.cos(angle + Math.PI)*40*gs.stats.player.chainSpeed)
      this.handSprite.x = this.hookedItem.x
      this.hookedItem.body.setVelocityY(Math.sin(angle + Math.PI)*40*gs.stats.player.chainSpeed)
      this.handSprite.y = this.hookedItem.y
      this.hand.length = Phaser.Math.Distance.Between(
        this.handSprite.x,
        this.handSprite.y,
        this.sprite.x,
        this.sprite.y
      )
    }else {
      this.hand.length += gs.stats.player.chainSpeed*(this.hand.going?1:-1)
      this.handSprite.x = (Math.cos(angle))*this.hand.length + this.anchorHand.x
      this.handSprite.y = (Math.sin(angle))*this.hand.length + this.anchorHand.y
    }
    
    if(this.hand.length <= 0) {
      this.hand.locked = false
      this.sounds.hook_return.play()
      this.graphics.clear()
    }
    
    // break this chain!
    if(this.hand.length>gs.stats.player.chainLength){
      if(this.hookedItem){
        this.hookedItem.release()
        this.hookedItem = undefined
      }
    }
    return angle
  }

  drawHand() {
    this.graphics.clear()
    this.graphics.lineStyle(2, 0x8b93af, 1)
    this.graphics.save()
    this.graphics.beginPath()
    this.graphics.moveTo(this.anchorHand.x, this.anchorHand.y)
    this.graphics.lineTo(this.handSprite.x, this.handSprite.y)
    this.graphics.strokePath()
    this.graphics.restore()
  }

  drawDebug(angle) {
    this.debugGraphic.clear()
    this.debugGraphic.lineStyle(1, 0xffffff, 1)
    this.debugGraphic.save()
    this.debugGraphic.beginPath()
    this.debugGraphic.moveTo(this.anchorHand.x, this.anchorHand.y)
    this.debugGraphic.lineTo(this.cursor.x, this.cursor.y)
    this.debugGraphic.strokePath()
    this.debugGraphic.lineStyle(1, 0xff00ff, 1)
    this.debugGraphic.moveTo(this.anchorHand.x, this.anchorHand.y)
    this.debugGraphic.lineTo(this.anchorHand.x + (Math.cos(angle))*gs.stats.player.chainLength, this.anchorHand.y+ (Math.sin(angle))*gs.stats.player.chainLength)
    this.debugGraphic.strokePath()
    this.debugGraphic.restore()
  }

  hook (item) {
    if(this.hookedItem === item || !this.hand.going) return
    this.sounds.hook_shot.stop()
    
    this.hookedItem = item
    if (!this.hookedItem.grab()) {
      this.hookedItem = undefined
      this.hookCollidesWall()
      return
    }
    this.hand.going = false
    let variation = ~~(Math.random()*2) + 1
    this.sounds[`impact_${this.hookedItem.material}_0${variation}`].play()
    
    // put a delay before to start pullingout
  }

  hookCollidesWall (wall) {
    this.sounds.hook_shot.stop()
    let code = Math.random()>0.5?'01':'02'
    this.sounds[`impact_fail_${code}`].play()
    this.hand.going = false
  }

  collectItem(item) {
    if(item !== this.hookedItem) return
    this.hand.locked = false
    this.sounds.hook_return.play()
    this.sounds.ninja_store.play()

    this.graphics.clear()
    this.handSprite.body.setVelocityX(0)
    this.handSprite.body.setVelocityY(0)
    
    let rawItem = JSON.parse(JSON.stringify(this.hookedItem.props))
    if(rawItem.typeKey=='heart' && gs.stats.player.life < gs.stats.player.maxlife){
      gs.set('player.life', gs.stats.player.life + 0.5)
    } else {
      gs.stats.inventory.items.push(rawItem)
    }
    //check if the item is one of the goals
    let totalCollected = 0
    for (var i = 0; i < gs.stats.game.targetItems.length; i++) {
      let target = gs.stats.game.targetItems[i]
      if(target.typeKey===rawItem.typeKey && target.special === rawItem.special){
        target.collectedByType = target.collectedByType?(target.collectedByType+1):1
      }
      if(target.collectedByType>0){
        totalCollected +=1
      }
    }
    if(totalCollected>=2){
      this.scene.wakeUpEnemies()
    }

    this.hookedItem.release()
    this.hookedItem = undefined
  }

  updateRaycast(angle){
    let dynamicSpeed = Math.random()*600 + 200
    this.raycast.body.setVelocity(Math.cos(angle)*dynamicSpeed, Math.sin(angle)*dynamicSpeed)
    let rayDistance = Phaser.Math.Distance.Squared(this.anchorHand.x, this.anchorHand.y, this.raycast.x, this.raycast.y)

    let maxDistance = gs.stats.player.chainLength*gs.stats.player.chainLength
    if(gs.stats.player.chaintoTarget) {
      maxDistance = Phaser.Math.Distance.Squared(this.anchorHand.x, this.anchorHand.y, this.cursor.x, this.cursor.y)
    }
    if(rayDistance > maxDistance) {
      this.raycast.x = this.anchorHand.x - 2.5
      this.raycast.y = this.anchorHand.y - 2.5
      if(this.raycastCollider){
        this.raycastCollider.setHighlight(false)
        this.raycastCollider = undefined
      }
    }
  }

  setRaycastCollider (collider) {
    if(this.raycastCollider && this.raycastCollider !=collider){
      this.raycastCollider.setHighlight(false)
    }

    this.raycast.x = this.anchorHand.x - 2.5
    this.raycast.y = this.anchorHand.y - 2.5
    this.raycastCollider = collider
    this.raycastCollider.setHighlight(true)
  }

  resetRayCast() {
    this.raycast.body.setVelocity(0,0)
    this.raycast.x = this.anchorHand.x - 2.5
    this.raycast.y = this.anchorHand.y - 2.5
  }

  openDoor(door){
    this.setStatus(STATUS.OPENING)

    this.sounds['door_open'].play()
    if(door.position==='top'){
      this.sprite.anims.play('pc-openning')
    }else {
      this.sprite.anims.play('pc-show_phone')
    }
  }
  finishOpenDoor() {
    this.setStatus(STATUS.IDLE)
  }

  getHit (damage) {
    if(this.status === STATUS.HIT) return
    this.setStatus(STATUS.HIT)
    gs.set('player.life', gs.stats.player.life - damage)
    this.sprite.anims.play('pc-hit')
    this.sounds.ninja_hurt.play()
    this.scene.cameras.main.shake(150, 0.005, 0.004)
    this.sprite.on('animationcomplete', (animation, frame) => {
      this.setStatus(STATUS.IDLE)
      this.sprite.off('animationcomplete')
    }, this)

    console.log('life:', gs.stats.player.life)
    if(gs.stats.player.life<=0){
      this.scene.gameOver()
    }
  }

  setStatus(status) {
    if(status === this.status) return
    if(this.status==STATUS.RUNNING){
      this.sounds.ninja_fs.stop()
    }
    if(status === STATUS.RUNNING) {
      this.sprite.anims.play('pc-run')
      this.sounds.ninja_fs.play({loop:-1})
    }
    if(status==STATUS.IDLE) {
      this.sprite.anims.play('pc-idle')
    }
    this.status = status
  }

}