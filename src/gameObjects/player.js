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
    let speed = gs.stats.player.speed
    
    this.sprite.body.setVelocity(0)
    this.sprite.body.setVelocityX(x*speed)
    this.sprite.body.setVelocityY(y*speed)
    this.sprite.body.velocity.normalize().scale(speed)

    // update cursor's position
    let angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, this.cursor.x, this.cursor.y)
    if(!this.hand.locked) {
      this.cursor.x = this.mousePointer.x + this.scene.cameras.main._scrollX
      this.cursor.y = this.mousePointer.y + this.scene.cameras.main._scrollY
    } else {
      this.updateHand()
      this.drawHand(angle)
    }

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
    console.log('launch')
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

  updateHand () {
    this.hand.lenght += gs.stats.player.chainSpeed*(this.hand.going?1:-1)

    let distanceToTarget = Phaser.Math.Distance.Squared(this.sprite.x, this.sprite.y, this.cursor.x, this.cursor.y)
    if(gs.stats.player.chaintoTarget && (this.hand.lenght*this.hand.lenght >= distanceToTarget)) {
      this.hand.going = false
    }else if(this.hand.lenght > gs.stats.player.chainLength) {
      this.hand.lenght = gs.stats.player.chainLength
      this.hand.going = false
    }
    if(this.hand.lenght <= 0) {
      this.hand.locked = false
      this.graphics.clear()
    }
  }

  drawHand(angle) {
    this.graphics.clear()
    this.graphics.lineStyle(2, 0x12aa99, 1)
    this.graphics.save()
    this.graphics.beginPath()
    this.graphics.moveTo(this.sprite.x, this.sprite.y)
    this.graphics.lineTo(this.sprite.x + (Math.cos(angle))*this.hand.lenght, this.sprite.y+ (Math.sin(angle))*this.hand.lenght)
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
}