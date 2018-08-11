import Scene from '../scene'

export default class DungeonMapHUDScene extends Scene {
  constructor () {
    super({key: 'dungeonMapHUDScene'})
  }

  create (params) {
    super.create(params)
    this.sceneManager.addGameScene(this.scene.key)
    this.registry.events.on('changedata', this.updateData, this)

    this.titleText.y += 40
    this.titleText.x += 40

    this.back = this.createButton({
      x: 300,
      y: 400,
      keyText: 'back',
      onClick: _ => this.close()
    })
  }

  updateData (parent, key, data) {
  }
  
  // dont  call the super update function....
  update() {}

  updateLanguageTexts () {
    this.back.reloadText()
  }
}