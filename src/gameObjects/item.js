
export default class Item extends Phaser.Physics.Arcade.Sprite {
	constructor(params) {
    super(params.scene, params.x, params.y, params.key||'items/chest-0', params.frame||0)
    this.scene = params.scene
    this.grabbed = false
    this.highlighted = false
    this.material = params.props.material
    this.props = params.props
  }

  update() {
    super.update()
  }
  setProperties() {
    this.setDrag(100, 100)
    this.setBounce(0.6, 0.6)
    this.setFriction(2, 2)
    this.setSize(12, 12, true)
  }

  grab() {
    this.grabbed = true
    return this.grabbed
  }
  release() {
    this.grabbed = false
  }
  
  setHighlight(highlighted) {
    this.highlighted = highlighted
    this.tint = this.highlighted?0xff99ff:0xffffff
    /*if(this.highlighted){
      this.setFrame(1)
    }else {
      this.setFrame(0)
    }*/
    
  }
}