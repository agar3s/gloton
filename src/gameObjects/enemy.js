import Item from './item'

const STATUS = {
  REST: 0,
  WAKE: 1,
  IDLE: 2
}
export default class Enemy extends Item {
  constructor(params) {
    super(params)

    if(!this.scene.anims.anims.entries['skeleton-resting']){
      this.scene.anims.create({
        key: 'skeleton-resting',
        frames: this.scene.generateFrameNames('characters/npc', 'skeleton-resting', 1),
        frameRate: 10,
        repeat: 0
      })
      this.scene.anims.create({
        key: 'skeleton-wake',
        frames: this.scene.generateFrameNames('characters/npc', 'skeleton-wake', 4),
        repeat: 0
      })
      this.scene.anims.anims.get('skeleton-wake').frames.forEach((frame, index)=>{
        frame.duration = 125
      })

      this.scene.anims.create({
        key: 'skeleton-idle',
        frames: this.scene.generateFrameNames('characters/npc', 'skeleton-idle', 8),
        frameRate: 10,
        repeat: -1
      })
    }
    this.tint = 0xffffff
    this.anims.play('skeleton-resting')
    this.status= STATUS.REST

    setTimeout(()=>{
      this.wake()
    }, (~~(Math.random()*10000)) + 3000)

    this.material = 'skeleton'
  }

  wake() {
    if(this.status === STATUS.REST)
    this.status = STATUS.WAKE
    console.log(this.anims.play('skeleton-wake'))
    this.on('animationcomplete', (animation, frame) => {
      this.status = STATUS.IDLE
      this.anims.play('skeleton-idle')
      this.off('animationcomplete')
    }, this)

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
    super.setHighlight(highlighted)
  }
}