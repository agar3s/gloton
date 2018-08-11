import gs from '../config/gameStats'

export default class Player {
  constructor(params) {
    this.scene = params.scene

    this.keys = this.scene.input.keyboard.addKeys('A,W,S,D')

    this.sprite = this.scene.physics.add
      .sprite(200, 200, 'player', 0)

    this.cursor = this.scene.add
      .sprite(200, 200, 'cursor')

    this.mousePointer = this.scene.input.mouse.manager.activePointer

    this.scene.input.on('pointerdown', pointer => {
    })

    this.scene.input.on('pointerup', pointer => {
      if(pointer.buttons==1)this.launch()
      if(pointer.buttons==2)this.expulse()
    })

    this.graphics = this.scene.add.graphics()
    this.graphics.lineStyle(2, 0xffffff, 1)
  }

  update () {
    let y = this.keys.W.isDown?-1:this.keys.S.isDown?1:0
    let x = this.keys.A.isDown?-1:this.keys.D.isDown?1:0
    let speed = 300
    this.sprite.body.setVelocity(0)
    this.sprite.body.setVelocityX(x*speed)
    this.sprite.body.setVelocityY(y*speed)

    this.sprite.body.velocity.normalize().scale(speed)

    // update cursor's position
    this.cursor.x = this.mousePointer.x + this.scene.cameras.main._scrollX
    this.cursor.y = this.mousePointer.y + this.scene.cameras.main._scrollY

    // draw the ray
    let angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, this.cursor.x, this.cursor.y)
    this.graphics.clear()
    this.graphics.lineStyle(1, 0xffffff, 1)
    this.graphics.save()
    this.graphics.beginPath()
    this.graphics.moveTo(this.sprite.x, this.sprite.y)
    this.graphics.lineTo(this.cursor.x, this.cursor.y)
    this.graphics.strokePath()
    this.graphics.lineStyle(2, 0xff00ff, 1)
    this.graphics.moveTo(this.sprite.x, this.sprite.y)
    this.graphics.lineTo(this.sprite.x + (Math.cos(angle))*gs.stats.player.chainLength, this.sprite.y+ (Math.sin(angle))*gs.stats.player.chainLength)
    this.graphics.strokePath()
    this.graphics.restore()
  }

  launch () {
    console.log('launch')
  }

  expulse () {
    console.log('expulse')
  }  
}