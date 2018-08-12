import gs from '../config/gameStats'
import constants from '../config/constants'

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
      params.textureKey || 'player',
      params.textureFrame || 0
    )

    this.sprite.setBounce(0, 0)

    // defines the raycast
    this.raycast = this.scene.add.zone(params.x, params.y).setSize(5, 5)
    this.scene.physics.world.enable(this.raycast)
    this.raycast.body.setAllowGravity(false)
    this.raycast.body.moves = true

    this.cursor = this.scene.add
      .sprite(params.x, params.y, 'cursor')

    this.handSprite = this.scene.physics.add
      .sprite(params.x, params.y, 'hand')

    this.mousePointer = this.scene.input.mouse.manager.activePointer

    this.scene.input.on('pointerdown', pointer => {
    })

    this.scene.input.on('pointerup', pointer => {
      if(pointer.buttons==1)this.launch()
      if(pointer.buttons==2)this.expulse()
    })

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
      hook: this.scene.sound.add('fx_hook_shot_01'),
      impact_metal_01: this.scene.sound.add('fx_impact_metal_01'),
      impact_metal_02: this.scene.sound.add('fx_impact_metal_02'),
      impact_wood_01: this.scene.sound.add('fx_impact_wood_01'),
      impact_wood_02: this.scene.sound.add('fx_impact_wood_02')
    }
    Object.keys(this.sounds).forEach(key=>{
      this.sounds[key].volume = 0.4
    })
  }

  update () {

    // get input from player
    let y = this.keys.w.isDown?-1:this.keys.s.isDown?1:0
    let x = this.keys.a.isDown?-1:this.keys.d.isDown?1:0
    let speed = gs.stats.player.speed * (this.hookedItem?0.7:1)
    
    this.sprite.body.setVelocity(0)
    this.sprite.body.setVelocityX(x*speed)
    this.sprite.body.setVelocityY(y*speed)
    this.sprite.body.velocity.normalize().scale(speed)

    // update cursor's position
    let angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, this.cursor.x, this.cursor.y)
    if(!this.hand.locked) {
      this.cursor.x = this.mousePointer.x + this.scene.cameras.main._scrollX
      this.cursor.y = this.mousePointer.y + this.scene.cameras.main._scrollY

      this.handSprite.x = this.sprite.x
      this.handSprite.y = this.sprite.y

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
    this.sounds.hook.play()
    // lock the hand/cursor
    this.hand.locked = true
    this.hand.lenght = 0
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

    this.scene.throwItem({
      x: this.sprite.x,
      y: this.sprite.y,
      key: 'box',
      vx: Math.cos(this.handSprite.rotation)*500,
      vy: Math.sin(this.handSprite.rotation)*500,
    })
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
  }

  updateHand (angle) {

    if(this.hand.going) {
      return this.updatePushingHand(angle)
    } else {
      return this.updatePullingHand(angle)
    }

  }

  updatePushingHand (angle) {
    this.hand.lenght += gs.stats.player.chainSpeed*(this.hand.going?1:-1)
    this.handSprite.x = (Math.cos(angle))*this.hand.lenght + this.sprite.x
    this.handSprite.y = (Math.sin(angle))*this.hand.lenght + this.sprite.y

    let distanceToTarget = Phaser.Math.Distance.Squared(this.sprite.x, this.sprite.y, this.cursor.x, this.cursor.y)
    if(gs.stats.player.chaintoTarget && (this.hand.lenght*this.hand.lenght >= distanceToTarget)) {
      this.hand.going = false
    }else if(this.hand.lenght > gs.stats.player.chainLength) {
      this.hand.lenght = gs.stats.player.chainLength
      this.hand.going = false
    }
    return angle
  }
  updatePullingHand (angle) {
    if(this.hookedItem) {
      angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, this.handSprite.x, this.handSprite.y)
      
      this.hookedItem.body.setVelocityX(Math.cos(angle + Math.PI)*40*gs.stats.player.chainSpeed)
      this.handSprite.body.setVelocityX(Math.cos(angle + Math.PI)*40*gs.stats.player.chainSpeed)
      this.hookedItem.body.setVelocityY(Math.sin(angle + Math.PI)*40*gs.stats.player.chainSpeed)
      this.handSprite.body.setVelocityY(Math.sin(angle + Math.PI)*40*gs.stats.player.chainSpeed)
    }else {
      this.hand.lenght += gs.stats.player.chainSpeed*(this.hand.going?1:-1)
      this.handSprite.x = (Math.cos(angle))*this.hand.lenght + this.sprite.x
      this.handSprite.y = (Math.sin(angle))*this.hand.lenght + this.sprite.y
    }
    if(this.hand.lenght <= 0) {
      this.hand.locked = false
      this.graphics.clear()
    }
    return angle
  }

  drawHand() {
    this.graphics.clear()
    this.graphics.lineStyle(2, 0x12aa99, 1)
    this.graphics.save()
    this.graphics.beginPath()
    this.graphics.moveTo(this.sprite.x, this.sprite.y)
    this.graphics.lineTo(this.handSprite.x, this.handSprite.y)
    this.graphics.strokePath()
    this.graphics.restore()
  }

  drawDebug(angle) {
    this.debugGraphic.clear()
    this.debugGraphic.lineStyle(1, 0xffffff, 1)
    this.debugGraphic.save()
    this.debugGraphic.beginPath()
    this.debugGraphic.moveTo(this.sprite.x, this.sprite.y)
    this.debugGraphic.lineTo(this.cursor.x, this.cursor.y)
    this.debugGraphic.strokePath()
    this.debugGraphic.lineStyle(1, 0xff00ff, 1)
    this.debugGraphic.moveTo(this.sprite.x, this.sprite.y)
    this.debugGraphic.lineTo(this.sprite.x + (Math.cos(angle))*gs.stats.player.chainLength, this.sprite.y+ (Math.sin(angle))*gs.stats.player.chainLength)
    this.debugGraphic.strokePath()
    this.debugGraphic.restore()
  }

  hook (item) {
    if(this.hookedItem === item || !this.hand.going) return
    this.hookedItem = item
    this.hand.going = false
    console.log('hook item!!')
    let material = ['metal_01', 'wood_01', 'metal_02', 'wood_02'][~~(Math.random()*4)]
    console.log('key', `impact_${material}`)
    this.sounds[`impact_${material}`].play()
    // put a delay before to start pullingout
  }

  grabItem(item) {
    if(item !== this.hookedItem) return
    console.log('save item!!')
    this.hand.locked = false
    this.graphics.clear()
    this.hookedItem.body.setVelocityX(0)
    this.handSprite.body.setVelocityX(0)
    this.hookedItem.body.setVelocityY(0)
    this.handSprite.body.setVelocityY(0)
    this.hookedItem.release()
    this.hookedItem = undefined
  }

  updateRaycast(angle){
    let dynamicSpeed = Math.random()*600 + 200
    this.raycast.body.setVelocity(Math.cos(angle)*dynamicSpeed, Math.sin(angle)*dynamicSpeed)
    let rayDistance = Phaser.Math.Distance.Squared(this.sprite.x, this.sprite.y, this.raycast.x, this.raycast.y)

    let maxDistance = gs.stats.player.chainLength*gs.stats.player.chainLength
    if(gs.stats.player.chaintoTarget) {
      maxDistance = Phaser.Math.Distance.Squared(this.sprite.x, this.sprite.y, this.cursor.x, this.cursor.y)
    }
    if(rayDistance > maxDistance) {
      this.raycast.x = this.sprite.x-2.5
      this.raycast.y = this.sprite.y-2.5
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
    this.raycast.x = this.sprite.x-2.5
    this.raycast.y = this.sprite.y-2.5
    this.raycastCollider = collider
    this.raycastCollider.setHighlight(true)
  }

  resetRayCast() {
    this.raycast.body.setVelocity(0,0)
    this.raycast.x = this.sprite.x-2.5
    this.raycast.y = this.sprite.y-2.5
  }

}