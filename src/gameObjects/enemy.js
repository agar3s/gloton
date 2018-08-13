import Item from './item'

const STATUS = {
  REST: 0,
  WAKE: 1,
  IDLE: 2,
  ALERT: 3,
  WALK: 4,
  ATTACK: 5,
  FIGHTING: 6
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

      this.scene.anims.create({
        key: 'skeleton-attack',
        frames: this.scene.generateFrameNames('characters/npc', 'skeleton-attack', 2),
        frameRate: 10,
        repeat: 0
      })
      this.scene.anims.anims.get('skeleton-attack').frames.forEach((frame, index)=>{
        frame.duration = 150
      })

      this.scene.anims.create({
        key: 'skeleton-walk',
        frames: this.scene.generateFrameNames('characters/npc', 'skeleton-walk', 2),
        repeat: -1
      })
      this.scene.anims.anims.get('skeleton-walk').frames.forEach((frame, index)=>{
        frame.duration = 300
      })

      this.scene.anims.create({
        key: 'skeleton-alert',
        frames: this.scene.generateFrameNames('characters/npc', 'skeleton-alert', 1),
        frameRate: 10,
        repeat: 0
      })
    }
    this.tint = 0xffffff
    this.anims.play('skeleton-resting')
    this.status= STATUS.REST

    setTimeout(()=>{
      this.wake()
    }, (~~(Math.random()*10000)) + 3000)

    this.material = 'skeleton'

    this.sounds = {
      skeleton_awake: this.scene.sound.add('fx_skeleton_awake'),
      skeleton_stunned: this.scene.sound.add('fx_skeleton_stunned')
    }
    Object.keys(this.sounds).forEach(key=>{
      this.sounds[key].volume = 0.5
    })

    this.direction = {
      x: 0,
      y: 0
    }
  }

  wake() {
    if(this.status === STATUS.REST)
    this.anims.play('skeleton-wake')
    this.sounds.skeleton_awake.play()
    this.on('animationcomplete', (animation, frame) => {
      this.status = STATUS.IDLE
      this.anims.play('skeleton-idle')
      this.off('animationcomplete')
    }, this)
/*
    setTimeout(()=>{
      this.anims.play('skeleton-alert')
    }, 1000)

    setTimeout(()=>{
      this.anims.play('skeleton-walk')
      this.status = STATUS.WALK
    }, 2000)

    setTimeout(()=>{
      
    }, 5000)
*/
  }

  update(player) {
    super.update()
    if(this.status === STATUS.REST) return
    if(this.status === STATUS.ATTACK) return
    // should walk in direction to the player
    //if(this.status == STATUS.IDLE) return

    let distance = Phaser.Math.Distance.Between(this.x, this.y-this.height/2, player.x, player.y-player.height/2)

    if(distance>16*8) {
      if(this.status!==STATUS.IDLE){
        this.status = STATUS.IDLE
        this.anims.play('skeleton-idle')
      }
    }else if(distance<(16)) {
      this.attack()
    }else {
      let angle = Phaser.Math.Angle.Between(this.x, this.y-this.height/2, player.x, player.y-player.height/2)
      this.direction.x = Math.cos(angle)
      this.direction.y = Math.sin(angle)
      this.flipX = this.direction.x>0
      if(this.status!== STATUS.WALK){
        this.anims.play('skeleton-walk')
        this.status = STATUS.WALK
      }
    }
    if(this.status === STATUS.WALK) {
      this.setVelocity(30*this.direction.x, 30*this.direction.y)
    }
  }

  attack() {
    this.status = STATUS.ATTACK
    this.setVelocity(0,0)
    this.anims.play('skeleton-attack')
    setTimeout(() => {
      this.scene.hitPlayer(this)
    }, 150)
    this.on('animationcomplete', (animation, frame) => {
      setTimeout(() => {
        this.status = STATUS.IDLE
        this.anims.play('skeleton-idle')
      }, 100)
      this.off('animationcomplete')
    }, this)
  }

  setProperties() {
    super.setProperties()
    this.setDrag(300, 300)
    this.setBounce(0.1, 0.1)
    this.setFriction(4, 4)
  }

  grab() {
    return false
  }
  release() {
    super.release()
  }
  
  setHighlight(highlighted) {
    super.setHighlight(highlighted)
  }
}