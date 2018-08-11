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

    this.pause = this.createButton({
      x: 50,
      y: 50,
      keyText: 'pause',
      onClick: (self) => {
        this.sceneManager.overlay('pauseScene')
      }
    })

    this.inventory = this.createButton({
      x: 150,
      y: 250,
      keyText: 'inventory',
      onClick: (self) => {
        this.sceneManager.overlay('dungeonInventoryHUDScene')
      }
    })

    this.map = this.createButton({
      x: 350,
      y: 250,
      keyText: 'map',
      onClick: (self) => {
        this.sceneManager.overlay('dungeonMapHUDScene')
      }
    })

    this.input.keyboard.on('keydown_Q', (event) => {
      this.sceneManager.overlay('dungeonInventoryHUDScene')
    })

    this.input.keyboard.on('keydown_E', (event) => {
      this.sceneManager.overlay('dungeonMapHUDScene')
    })
  }

  updateData (parent, key, data) {
  }
  
  // dont  call the super update function....
  update() {}

  updateLanguageTexts () {
    this.pause.reloadText()
    this.inventory.reloadText()
    this.map.reloadText()
  }

}