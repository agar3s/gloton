import Scene from '../scene'

export default class TutorialScene extends Scene {
  constructor() {
    super({ key: 'tutorialScene' })
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

    /* this.add
      .image(
        this.cameras.main.width / 2,
        12,
        `tutorial`
      )
      .setOrigin(0.5, 0)

    const keys = [
      { textKey: 'tutorial_step_1', x: 11, y: 103, highlihtLimit: 4},
      { textKey: 'tutorial_step_2', x: 121, y: 103, highlihtLimit: 5},
      { textKey: 'tutorial_step_3', x: 228, y: 97, highlihtLimit: 11},
      { textKey: 'tutorial_step_4', x: 10, y: 171, highlihtLimit: 1},
      { textKey: 'tutorial_step_5', x: 185, y: 140, highlihtLimit: 4}
    ]

    keys.forEach(element => {
      this.addDynamicBitmapText(element)
    }) */

    this.add
      .image(
        this.cameras.main.width / 2,
        12,
        `tutorial_${this.translator.languageCode}`
      )
      .setOrigin(0.5, 0)

    this.next = this.createButton({
      x: 10,
      y: 215,
      keyText: 'tutorial_next',
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

  addDynamicBitmapText(params) {
    this.add
      .dynamicBitmapText(
        params.x,
        params.y,
        this.fonts.BM_kenneyMiniSquare.font,
        this.getText(params.textKey),
        8
      )
      .setCenterAlign()
      .setDisplayCallback(data => {
        if (data.index > params.highlihtLimit) {
          data.color = 0x0aabff
        }
        return data
      })
  }
}
