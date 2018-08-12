
export default class Item extends Phaser.Physics.Arcade.Sprite {
	constructor(params) {
    super(params.scene, params.x, params.y, params.key||'box', params.frame||0)
    this.scene = params.scene
    this.grabbed = false
    this.tint = ~~(0x333333+(0xCCCCCC*Math.random()))
  }

  update() {
    this.sprite.update()
  }
  setProperties() {
    this.setDrag(100, 100)
    this.setBounce(1, 1)
    this.setSize(12, 12, true)
  }

  grab() {
    this.grabbed = true
  }
  release() {
    
    this.grabbed = false
  }
}