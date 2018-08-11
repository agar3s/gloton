import gs from '../config/gameStats'
import constants from '../config/constants'

export default class Player {
  constructor(params) {
    this.scene = params.scene

    this.keys = this.scene.input.keyboard.addKeys('A,W,S,D')

    this.sprite = this.scene.physics.add
      .sprite(params.x, params.y, 'player', 0)

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
  }

  update () {

    // get input from player
    let y = this.keys.W.isDown?-1:this.keys.S.isDown?1:0
    let x = this.keys.A.isDown?-1:this.keys.D.isDown?1:0
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
    // lock the hand/cursor
    this.hand.locked = true
    this.hand.lenght = 0
    this.hand.going = true

    // draw a ray in direction to the cursor
    // check for collision in the trayectory
    // 
  }

  expulse () {
    console.log('expulse')
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
      
      this.hookedItem.sprite.body.setVelocityX(Math.cos(angle + Math.PI)*40*gs.stats.player.chainSpeed)
      this.handSprite.body.setVelocityX(Math.cos(angle + Math.PI)*40*gs.stats.player.chainSpeed)
      this.hookedItem.sprite.body.setVelocityY(Math.sin(angle + Math.PI)*40*gs.stats.player.chainSpeed)
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
    // put a delay before to start pullingout
  }

  grabItem(item) {
    if(item !== this.hookedItem) return
    console.log('save item!!')
    this.hand.locked = false
    this.graphics.clear()
    this.hookedItem.sprite.body.setVelocityX(0)
    this.handSprite.body.setVelocityX(0)
    this.hookedItem.sprite.body.setVelocityY(0)
    this.handSprite.body.setVelocityY(0)
    this.hookedItem = undefined
  }
}