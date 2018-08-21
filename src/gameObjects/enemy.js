import Item from './item'

const STATUS = {
  REST: 0,
  WAKE: 1,
  IDLE: 2,
  ALERT: 3,
  WALK: 4,
  ATTACK: 5,
  STUN: 6,
  FIGHTING: 7,
  ONHIT: 8,
  STORED: 9
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
        duration: 400,
        repeat: 0
      })
      this.scene.anims.create({
        key: 'skeleton-hit',
        frames: this.scene.generateFrameNames('characters/npc', 'skeleton-hit', 2),
        frameRate: 10,
        repeat: 0
      })
      this.scene.anims.create({
        key: 'skeleton-stun',
        frames: this.scene.generateFrameNames('characters/npc', 'skeleton-stun', 2),
        frameRate: 10,
        repeat: -1
      })
    }
    this.tint = 0xffffff
    this.anims.play('skeleton-resting')
    this.status= STATUS.REST

    // setTimeout(()=>{
    //   this.wake()
    // }, (~~(Math.random()*10000)) + 3000)

    this.material = 'skeleton'

    this.sounds = {
      skeleton_awake: this.scene.sound.add('fx_skeleton_awake'),
      skeleton_fs: this.scene.sound.add('fx_skeleton_fs'),
      skeleton_attack: this.scene.sound.add('fx_skeleton_attack'),
      skeleton_stunned: this.scene.sound.add('fx_skeleton_stunned'),
      skeleton_hurt: this.scene.sound.add('fx_skeleton_hurt'),
      skeleton_alarm: this.scene.sound.add('fx_skeleton_alarm')
    }
    Object.keys(this.sounds).forEach(key => {
      this.sounds[key].volume = 0.4
    })

    this.direction = {
      x: 0,
      y: 0
    }
    this.props = {
      type: 'skeleton',
      speed: 30,
      baseHP: 3,
      sightRadius: 7,
      typeKey: 'skeleton',
      special: 'cursed',
      color: 0xffffff,
      damage: 0.5
    }

    this.props.speed = params.props.speed || this.props.speed
    this.props.baseHP = params.props.baseHP || this.props.baseHP
    this.props.sightRadius = params.props.sightRadius || this.props.sightRadius

    this.hitpoints = this.props.baseHP
    this.damage = this.props.damage
  }

  wake(silenceWakeup) {
    if(this.grabbed || 
      this.status === STATUS.STORED || 
      this.status === STATUS.IDLE ||
      this.status === STATUS.WALK ||
      this.status === STATUS.ATTACK ) {
      return
    }
    if(this.status === STATUS.STUN) {
      this.restoreStun.destroy()
      this.status = STATUS.REST
    }
    if(this.status === STATUS.REST) this.hitpoints = this.props.baseHP
    this.anims.play('skeleton-wake')
    if(!silenceWakeup) this.sounds.skeleton_awake.play()
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
    if(this.status === STATUS.ALERT) return
    if(this.status === STATUS.ATTACK) return
    if(this.status === STATUS.ONHIT) return
    if(this.status === STATUS.STUN) return
    // should walk in direction to the player
    //if(this.status == STATUS.IDLE) return

    let distance = Phaser.Math.Distance.Between(this.x, this.y-this.height/2, player.x, player.y-player.height/2)

    if(distance>16*this.props.sightRadius) {
      if(this.status!==STATUS.IDLE){
        this.status = STATUS.IDLE
        this.anims.play('skeleton-idle')
        this.sounds.skeleton_fs.stop()
      }
    }else if(distance<(16)) {
      this.attack()
    }else {
      let angle = Phaser.Math.Angle.Between(this.x, this.y-this.height/2, player.x, player.y-player.height/2)
      this.direction.x = Math.cos(angle)
      this.direction.y = Math.sin(angle)
      this.flipX = this.direction.x>0
      if(this.status!== STATUS.WALK){
        this.anims.play('skeleton-alert')
        this.sounds.skeleton_alarm.play()
        this.status = STATUS.ALERT
        this.on('animationcomplete', (animation, frame) => {
          this.sounds.skeleton_fs.play({loop:-1})
          this.anims.play('skeleton-walk')
          this.off('animationcomplete')
          this.status = STATUS.WALK
        })
      }
    }
    if(this.status === STATUS.WALK) {
      this.setVelocity(this.props.speed*this.direction.x, this.props.speed*this.direction.y)
    }
  }

  attack() {
    this.status = STATUS.ATTACK
    this.setVelocity(0,0)
    this.anims.play('skeleton-attack')
    this.sounds.skeleton_fs.stop()
    this.sounds.skeleton_attack.play()
    setTimeout(() => {
      this.scene.hitPlayer(this)
    }, 150)
    this.on('animationcomplete', (animation, frame) => {
      setTimeout(() => {
        this.status = STATUS.IDLE
        this.sounds.skeleton_fs.stop()
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

  takesDamage(damage){
    this.hitpoints -= damage
    this.sounds.skeleton_fs.stop()
    if(this.hitpoints <= 0){
      this.status = STATUS.STUN
      this.sounds.skeleton_stunned.play()
      this.anims.play('skeleton-stun')
      this.restoreStun = this.scene.time.delayedCall(5000, this.wake, [], this)
    }else{
      this.anims.play('skeleton-hit')
      this.sounds.skeleton_hurt.play()
      this.status = STATUS.ONHIT
      this.on('animationcomplete', (animation, frame) => {
        this.status = STATUS.IDLE
        this.anims.play('skeleton-idle')
        this.off('animationcomplete')
      }, this)
    }
  }

  grab() {
    if(this.status === STATUS.REST) {
      this.wake()
    }
    if(this.status === STATUS.STUN) {
      this.grabbed = true
      return true
    }
    return false
  }
  release() {
    super.release()
  }

  destroy() {
    super.destroy()
    this.status = STATUS.STORED
    Object.keys(this.sounds).forEach(key => {
      this.sounds[key].stop()
      try{
        this.sounds[key].destroy()
      }catch(excption){
        console.log(excption)
        console.log('is null', this.sounds[key])
      }
      delete this.sounds[key]
    })
    if(this.restoreStun)this.restoreStun.destroy()
  }
  
  setHighlight(highlighted) {
    super.setHighlight(highlighted)
    if(!highlighted) {
      this.tint = this.props.color
    }
  }
}