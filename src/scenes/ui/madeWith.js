import Scene from '../scene'

export default class MadeWithScene extends Scene {
  constructor () {
    super({key: 'madeWithScene'})
    this.timesplash = this.constants.TIME_MADE_WITH
    this.nextScene = 'mainMenuScene'
  }

  create (params) {
    super.create(params)
    this.logo = this.add.sprite(this.cameras.main.width/2, this.cameras.main.height/2, 'logo')

    //this.cameras.main.fade(this.constants.TIME_MADE_WITH/2)
    this.time.delayedCall(this.timesplash, () => {
      this.changeToScene(this.nextScene)
    }, [], this)
  }

}