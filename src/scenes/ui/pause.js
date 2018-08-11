import Scene from '../scene'
import getDataManager from '../../managers/dataManager'
import gs from '../../config/gameStats'

export default class PauseScene extends Scene {
  constructor() {
    super({ key: 'pauseScene' })
  }

  create(params) {
    super.create(params)
    // objects
    let graphics = this.add.graphics()
    graphics.fillStyle(0x331122, 0.8)
    graphics.fillRect(0, 0, 800, 600)
    // graphics
    // buttons
    this.resume = this.createButton({
      x: 100,
      y: 200,
      keyText: 'resume',
      onClick: _ => this.close()
    })

    this.audio = this.createButton({
      x: 100,
      y: 250,
      keyText: 'audio',
      onClick: _ => {

      }
    })

    this.language = this.createButton({
      x: 100,
      y: 300,
      keyText: 'language',
      onClick: _ => {
        this.translator.changeLanguage()
        this.sceneManager.updateLanguageTexts()
      }
    })

    this.exit = this.createButton({
      x: 100,
      y: 350,
      keyText: 'exit',
      onClick: _ => this.changeToScene('mainMenuScene')
    })

    this.titleText.y += 40
    this.titleText.x += 40

    //events

    this.events.on('shutdown', _ => this.shutdown(), this)
    this.sceneManager.pauseGame()
  }

  shutdown() {
    this.sceneManager.resumeGame()
    this.events.off('shutdown')
  }

  updateLanguageTexts () {
    this.resume.reloadText()
    this.audio.reloadText()
    this.language.reloadText()
    this.exit.reloadText()
  }
}