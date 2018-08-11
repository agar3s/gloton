import Scene from '../scene'
import gs from '../../config/gameStats'

export default class MissionGameScene extends Scene {
  constructor () {
    super({key: 'missionGameScene'})
  }
  

  create (params) {
    super.create(params)

    this.events.on('shutdown', () => {
      this.shutdown()
    }, this)

    this.next = this.createButton({
      x: 30,
      y: 100,
      keyText: 'next',
      onClick: (self) => {
        this.changeToScene('dungeonGameScene')
      }
    })
  }

  shutdown() {
    this.events.off('shutdown')

  }

  update () {
    super.update()
  }

}