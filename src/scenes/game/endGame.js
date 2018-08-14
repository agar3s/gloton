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

    // big text
    this.add
      .bitmapText(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        this.fonts.BM_kenneyMiniSquare.font,
        this.getText(gs.stats.game.win ? 'end_success' : 'end_failure'),
        gs.stats.game.win ? 24 : 18
      )
      .setCenterAlign()
      .setTint(gs.stats.game.win ? 0x0aabff : 0xff3900)
      .setOrigin(0.5)

    this.next = this.createButton({
      x: 10,
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
  }

  shutdown() {
    this.events.off('shutdown')
  }

  update() {
    super.update()
  }
}
