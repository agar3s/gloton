import Item from './item'

export default class Enemy extends Item {
  constructor(params) {
    super(params)

    if(!this.scene.anims.anims.entries['skeleton-idle']){
      this.scene.anims.create({
        key: 'skeleton-idle',
        frames: this.scene.generateFrameNames('characters/npc', 'skeleton-idle', 8),
        frameRate: 10,
        repeat: -1
      })
    }
    this.tint = 0xffffff
    this.anims.play('skeleton-idle')

  }

  update() {
    super.update()
    this.sprite.update()
  }
  setProperties() {
    super.setProperties()
    this.setDrag(300, 300)
    this.setBounce(0.1, 0.1)
    this.setFriction(4, 4)
  }

  grab() {
    super.grab()
  }
  release() {
    super.release()
  }
  
  setHighlight(highlighted) {
    //super.setHighlight(highlighted)
  }
}