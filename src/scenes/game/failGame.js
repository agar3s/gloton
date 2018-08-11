import Scene from '../scene'
import gs from '../../config/gameStats'

export default class FailGameScene extends Scene {
  constructor () {
    super({key: 'failGameScene'})
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
        this.changeToScene('worldGameScene')
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