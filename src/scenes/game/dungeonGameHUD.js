import Scene from '../scene'
import gs from '../../config/gameStats'

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
    this.maxTime = 179
    
    this.ninjaSprite = this.add.sprite(19, 240 - 19,'ninja')

    this.heartSprites = []
    for (var i = 0; i < gs.stats.player.maxlife; i++) {
      let heart = this.add.sprite(28+8+10+21*i, 240 - 17, 'life', 0)
      this.heartSprites.push(heart)
    }

    this.map = this.add.sprite(19, 32 + 28 + 12 + 14, 'mapa')
    this.input.keyboard.on('keydown_E', (event) => {
      //this.sceneManager.overlay('dungeonMapHUDScene')
    })

    this.setupBackpack()

    this.messageDisplay = this.add.bitmapText(
      90,
      140,
      this.fonts.BM_kenneyMiniSquare.font,
      this.getText('not_ready')
    )
    this.messageDisplay.setVisible(false)

    gs.setListener('player.life', (life) => {
      let integerLife = ~~life
      let dotFive = life - integerLife
      for (var i = 0; i < this.heartSprites.length; i++) {
        if(integerLife>i) this.heartSprites[i].setFrame(0)
        else if(integerLife==i && dotFive==0.5) this.heartSprites[i].setFrame(1)
        else this.heartSprites[i].setFrame(2)
      }
    })

    gs.setListener('hud.endMissionConfirmationOpen', (status)=>{
      this.messageDisplay.setVisible(status)
    })

    this.timerHandlerData = {
      hurryUp: false,
      counter: 0,
      intensity: 29
    }
  }

  setupBackpack () {
    this.backpack = this.add.sprite(19, 32 + 8 + 14, 'backpack')
    this.backpack.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.backpack.width, this.backpack.height), Phaser.Geom.Rectangle.Contains)
    this.backpack.setData('type', 'button')

    this.backpack.onHover= () => {
      this.backpack.tint = 0x00cbff
    }
    this.backpack.onOut= () => {
      this.backpack.tint = 0xffffff
    }
    this.backpack.onClick = () => {
      this.openInventory()
    }

    this.input.keyboard.on('keydown_Q', (event) => {
      this.openInventory()
    })
  }

  openInventory () {
    if(!gs.stats.hud.inventoryOpen && !gs.stats.hud.mapOpen) {    
      this.sceneManager.overlay('dungeonInventoryHUDScene')
      gs.stats.hud.inventoryOpen = true
    } else if(gs.stats.hud.inventoryOpen) {
      this.sceneManager.closeMenu('dungeonInventoryHUDScene')
      gs.stats.hud.inventoryOpen = false
    }
  }

  updateData (parent, key, data) {
    if ( key === 'timer' && this.elapsedSeconds != data) {
      let time = this.maxTime - this.elapsedSeconds
      let mins = ~~(time/60)
      let seconds = time%60

      if(mins == 0){
        if(seconds == 59){
          this.timerHandlerData.hurryUp = true
          this.timerHandlerData.counter = 0
          this.timerHandlerData.intensity = 29
        } else if(seconds == 30){
          this.timerHandlerData.intensity = 15
          this.registry.set('musicRate', 1.333)
        } else if(seconds == 15){
          this.timerHandlerData.intensity = 7
        } else if(seconds == 5){
          this.registry.set('musicRate', 1.5)
          this.timerHandlerData.intensity = 3
        }
      }

      if(seconds<10) seconds = '0'+seconds
      this.timerText.setText(`0${mins}:${seconds}`)
      this.elapsedSeconds = data
    }
  }
  
  // dont  call the super update function....
  update() {
    if(this.timerHandlerData.hurryUp){
      this.timerHandlerData.counter++
      if(this.timerHandlerData.counter%this.timerHandlerData.intensity==0){
        this.timerText.tint = (this.timerHandlerData.counter%2==0)?0x00cbff:0xffffff
      }
    }
  }

  updateLanguageTexts () {
    this.pause.reloadText()
    this.inventory.reloadText()
    this.map.reloadText()
  }

}