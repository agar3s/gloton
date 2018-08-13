
export default class Item extends Phaser.Physics.Arcade.Sprite {
	constructor(params) {
    super(params.scene, params.x, params.y, params.key||'items/chest-0', params.frame||0)
    this.scene = params.scene
    this.grabbed = false
    this.highlighted = false
  }

  update() {
    this.sprite.update()
  }
  setProperties() {
    this.setDrag(100, 100)
    this.setBounce(0.6, 0.6)
    this.setFriction(2, 2)
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
    /*if(this.highlighted){
      this.setFrame(1)
    }else {
      this.setFrame(0)
    }*/
    
  }
}