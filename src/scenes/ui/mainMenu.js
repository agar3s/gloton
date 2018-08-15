import Scene from '../scene'
import getDataManager from '../../managers/dataManager'
import gs from '../../config/gameStats'
import constants from '../../config/constants'
import tunner from '../../utils/tunner'

export default class MainMenuScene extends Scene {
  constructor() {
    super({ key: 'mainMenuScene' })
  }

  create(params) {
    super.create(params)

    this.add.image(0, 0, 'titleBackground').setOrigin(0)
    this.events.on('shutdown', _ => this.shutdown(), this)

    this.buttonSelect = this.sound.add('fx_button_select')

    // you can set your button with a custom behaviour
    // by default, onHover and onOut events just tint
    // the sprite
    // font key is the default font family set up in the
    // base "Scene" file.
    this.start = this.createButton({
      x: this.cameras.main.width / 2,
      y: 190,
      style: this.fonts.BM_kenneyMiniSquare,
      size: 14,
      text: this.getText('start'),
      color: 0xffff00,
      onClick: (self) => {
        this.buttonSelect.play()
        this.changeToScene('tutorialScene')
      },
      onHover: (self) => {
        self.setTint(0xff99ff)
      },
      onOut: (self) => {
        self.setTint(0xffffff)
      },
      scale: 1.0
    })

    this.credits = this.createButton({
      x: this.cameras.main.width / 2,
      y: 210,
      keyText: 'credits',
      style: this.fonts.BM_kenneyMiniSquare,
      size: 12,
      onClick: _ => {
        this.open('creditsScene')
        //gs.stats.permanentObjects.mainMusic.stop()
      }
    })

    

    this.setLanguageButton = this.createButton({
      x: this.credits.x + this.credits.width + 32,
      y: 210,
      keyText: 'language',
      style: this.fonts.BM_kenneyMiniSquare,
      size: 12,
      onClick: (self) => {
        this.translator.changeLanguage()
        this.updateLanguageTexts()
      }
    })

    console.log(this.cameras.main)
  }

  updateLanguageTexts () {
    this.start.setText( this.getText('start') )
    this.credits.reloadText()
    this.setLanguageButton.reloadText()
  }

  shutdown() {
    this.events.off('shutdown')
    gs.stats.permanentObjects.mainMusic.stop()
  }

}