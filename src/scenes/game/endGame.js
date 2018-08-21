import Scene from '../scene'
import gs from '../../config/gameStats'

export default class EndGameScene extends Scene {
  constructor() {
    super({ key: 'endGameScene' })
  }

  create(params) {
    super.create(params)

    this.events.on(
      'shutdown',
      () => {
        this.shutdown()
      },
      this
    )

    let graphics = this.add.graphics()
    graphics.fillStyle(0x1e1f30, 0.8)
    graphics.fillRect(0, 0, 320, 240)

    if (!gs.stats.game.win) {
      if (gs.stats.game.timesup) {
        this.add.image(160, 90, 'timerTimesup').setOrigin(0.5)
        this.add.image(160, 120, 'timesUpTitle').setOrigin(0.5)
      } else {
        this.add.image(81, 69, 'gameOverTitle').setOrigin(0)
        this.add.image(121, 164, 'gameOverNinja').setOrigin(0)
      }
    }

    // big text
    this.add
      .bitmapText(
        this.cameras.main.width / 2,
        145,
        this.fonts.BM_kenneyMiniSquare.font,
        this.getText(gs.stats.game.win ? 'end_success' : 'end_failure'),
        gs.stats.game.win ? 20 : 12
      )
      .setCenterAlign()
      .setTint(gs.stats.game.win ? 0x0aabff : 0xffffff)
      .setOrigin(0.5)

    this.next = this.createButton({
      x: 220,
      y: 215,
      keyText: gs.stats.game.win
        ? 'end_tryAgain_success'
        : 'end_tryAgain_failure',
      style: this.fonts.BM_kenneyMiniSquare,
      size: 14,
      onClick: self => {
        this.changeToScene('missionGameScene')
      }
    })
    if(gs.stats.game.win){
      this.next.x -= 60
    }
  }

  shutdown() {
    this.events.off('shutdown')
  }

  update() {
    super.update()
  }
}
