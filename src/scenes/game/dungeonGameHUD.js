import Scene from '../scene'

export default class DungeonGameHUDScene extends Scene {
  constructor () {
    super({key: 'dungeonGameHUDScene'})
  }

  create (params) {
    super.create(params)
    this.sceneManager.addGameScene(this.scene.key)
    this.registry.events.on('changedata', this.updateData, this)

    this.titleText.y += 20
    this.titleText.x += 20

    /*this.pause = this.createButton({
      x: 0,
      y: 0,
      keyText: 'pause',
      onClick: (self) => {
        this.sceneManager.overlay('pauseScene')
      }
    })*/

    this.timerSprite = this.add.sprite(25,21,'timer')
    this.timerText = this.add.bitmapText(
      14,
      21,
      this.fonts.BM_kenneyMiniSquare.font,
      '03:00'
    )
    this.timerText.setTint(0x00cbff)
    this.elapsedSeconds = 0
    this.maxTime = 3 * 60
    
    this.ninjaSprite = this.add.sprite(19, 240 - 19,'ninja')

    this.hearthSprite01 = this.add.sprite(28+8+10, 240 - 17, 'life', 0)
    this.hearthSprite02 = this.add.sprite(28+8+10+21, 240 - 17, 'life', 1)
    this.hearthSprite03 = this.add.sprite(28+8+10+21*2, 240 - 17, 'life', 2)

    this.backpack = this.add.sprite(19, 32 + 8 + 14, 'backpack')
    this.map = this.add.sprite(19, 32 + 28 + 12 + 14, 'mapa')


    this.input.keyboard.on('keydown_Q', (event) => {
      this.sceneManager.overlay('dungeonInventoryHUDScene')
    })

    this.input.keyboard.on('keydown_E', (event) => {
      this.sceneManager.overlay('dungeonMapHUDScene')
    })

    this.registry.events.on('changedata', this.updateData, this)
  }

  updateData (parent, key, data) {
    if ( key === 'timer' && this.elapsedSeconds != data) {
      let time = this.maxTime - this.elapsedSeconds
      let mins = ~~(time/60)
      let seconds = time%60
      if(seconds<10) seconds = '0'+seconds
      this.timerText.setText(`0${mins}:${seconds}`)
      this.elapsedSeconds = data
    }
  }
  
  // dont  call the super update function....
  update() {}

  updateLanguageTexts () {
    this.pause.reloadText()
    this.inventory.reloadText()
    this.map.reloadText()
  }

}