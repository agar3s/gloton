import Scene from '../scene'
import constants from '../../config/constants'

//const env = 'PRODUCTION'
const env = 'DEV'

export default class BootScene extends Scene {
  constructor () {
    super({key: 'bootScene'})

    this.nextScene = constants.SCENE_AFTER_BOOT
  }

  preload () {
    super.preload()

    let progressBox = this.add.graphics()
    let progressBar = this.add.graphics()

    let width = this.cameras.main.width
    let height = this.cameras.main.height
    let loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 30,
      text: 'Loading...',
      style: {
        font: '30px monospace',
        fill: '#ffffff'
      }
    })
    loadingText.setOrigin(0.5, 0.5)

    let percentText = this.make.text({
      x: width / 2,
      y: height / 2 + 25,
      text: '0%',
      style: {
          font: '20px monospace',
          fill: '#999999'
      }
    })
    percentText.setOrigin(0.5, 0.5)

    let assetText = this.make.text({
      x: width / 2,
      y: height / 2 + 65,
      text: '',
      style: {
        font: '18px monospace',
        fill: '#ffffff'
      }
    })
    assetText.setOrigin(0.5, 0.5)

    progressBox.fillStyle(0x666666, 1)
    progressBox.fillRect(width/2 - 160, height/2, 320, 50)


    this.load.on('progress', (value) => {
      progressBar.clear()
      progressBar.fillStyle(0x333333, 1)
      progressBar.fillRect(width/2 + 10 - 160, height/2 + 10, 300 * value, 30)
      percentText.setText(parseInt(value * 100) + '%')
    })
                
    this.load.on('fileprogress', (file) => {
      assetText.setText(file.key + ' ready')
    })
     
    this.load.on('complete', () => {
      progressBar.destroy()
      progressBox.destroy()
      loadingText.destroy()
      percentText.destroy()
      assetText.destroy()

      this.changeToScene(this.nextScene)
    })

    // load files
    let urlBase = ''
    if(env == 'PRODUCTION') {
      urlBase = awsPrefix
    }

    // load logo
    this.load.spritesheet('logo', urlBase + 'assets/phaser3-logo.png', { frameWidth: 412, frameHeight: 93 })    
    // load fonts
    this.load.bitmapFont(this.fonts.BM_keney.font, urlBase + 'assets/fonts/keneyFont_0.png', urlBase + 'assets/fonts/keneyFont.fnt')

    // prototype assets
    this.load.spritesheet('player', urlBase + 'assets/player_test.png', { frameWidth: 16, frameHeight: 16 })
    this.load.spritesheet('cursor', urlBase + 'assets/cursor.png', { frameWidth: 9, frameHeight: 9 })

    // load json
    this.load.json('translations', urlBase + 'assets/texts.json')

    // fake loader
    if (this.constants.FAKE_LOADER_ACTIVE) {
      for (var i = 0; i < 500; i++) {
        this.load.spritesheet(`logo-${i}`, urlBase + 'assets/phaserLogo.png', { frameWidth: 382, frameHeight: 331 })
      }
    }
  }
}