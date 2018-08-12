
export default class Item extends Phaser.Physics.Arcade.Sprite {
	constructor(params) {
    super(params.scene, params.x, params.y, params.key||'box', params.frame||0)
    this.scene = params.scene
    this.grabbed = false
    this.tint = ~~(0x333333+(0xCCCCCC*Math.random()))
    this.highlighted = false
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
  
  setHighlight(highlighted) {
    this.highlighted = highlighted
    if(this.highlighted){
      this.setFrame(1)
    }else {
      this.setFrame(0)
    }
    
  }
}