import Scene from '../scene'
import gs from '../../config/gameStats'

import generateItem from '../../config/itemGenerator'

export default class MissionGameScene extends Scene {
  constructor() {
    super({ key: 'missionGameScene' })
  }

  create(params) {
    super.create(params)

    this.buttonSelect = this.sound.add('fx_button_select')

    // reset the target items and winning condition
    gs.stats.game.targetItems = []
    gs.stats.game.win = false

    this.events.on(
      'shutdown',
      () => {
        this.shutdown()
      },
      this
    )

    // ┌ add the texts for the scene ──────────────────────────────────────────┐
    this.titleTxt = this.add.bitmapText(
      this.cameras.main.width / 2,
      10,
      this.fonts.BM_kenneyMiniSquare.font,
      this.getText('mission_title'),
      12
    )
    this.titleText.align = 1
    this.titleTxt.tint = 0xffff00
    this.titleTxt.setOrigin(0.5, 0)
    
    this.invitationTxt = this.add.bitmapText(
      this.cameras.main.width / 2,
      50+20,
      this.fonts.BM_kenneyMiniSquare.font,
      this.getText('mission_invitation'),
      12
    )
    this.invitationTxt.align = 1
    this.invitationTxt.setOrigin(0.5, 0)

    // generate and item and set it as the mission for the player
    for (let task = 0; task < 3; task++) {
      const item = generateItem()
      this.add.bitmapText(
        10,
        80+20+(15*task),
        this.fonts.BM_kenneyMini.font,
        this.getText('mission_item_desc', [
          this.getText(`item_${item.typeKey}`),
          this.getText(`item_${item.special}`)
        ]),
        12
      )
      gs.stats.game.targetItems.push(item)
    }
    // └───────────────────────────────────────────────────────────────────────┘

    this.next = this.createButton({
      x: 10,
      y: 215,
      keyText: 'next',
      style: this.fonts.BM_kenneyMiniSquare,
      size: 14,
      onClick: self => {
        this.buttonSelect.play()
        this.changeToScene('dungeonRoguelikeGameScene')
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
