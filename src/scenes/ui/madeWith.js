import Scene from '../scene'
import gs from '../../config/gameStats'

export default class MadeWithScene extends Scene {
  constructor () {
    super({key: 'madeWithScene'})
    this.timesplash = this.constants.TIME_MADE_WITH
    this.nextScene = 'mainMenuScene'
  }

  create (params) {
    super.create(params)
    this.events.on('shutdown', _ => this.shutdown(), this)

    this.logo = this.add.sprite(this.cameras.main.width/2, this.cameras.main.height/2, 'logo')


    //this.cameras.main.fade(this.constants.TIME_MADE_WITH/2)
    this.time.delayedCall(this.timesplash, () => {
      this.changeToScene(this.nextScene)
    }, [], this)

    gs.stats.permanentObjects.mainMusic = this.sound.add('mx_title')
    gs.stats.permanentObjects.mainMusic.volume = 0.5
    gs.stats.permanentObjects.mainMusic.play({
      loop:-1
    })

    //this.cameras.main.width *= this.constants.SCALE
    //this.cameras.main.height *= this.constants.SCALE
    //this.cameras.main.fadeIn(800)
  }

  shutdown() {
    this.events.off('shutdown')
  }

}