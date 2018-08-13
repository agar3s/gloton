import Item from './item'

export default class Enemy extends Item {
  constructor(params) {
    super(params)
    this.scene.anims.create({
      key: 'skeleton-idle',
      frames: this.scene.generateFrameNames('characters/npc', 'skeleton-idle', 8),
      frameRate: 10,
      repeat: -1
    })
    this.tint = 0xffffff
    this.anims.play('skeleton-idle')

  }

  update() {
    super.update()
    this.sprite.update()
  }
  setProperties() {
    super.setProperties()
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