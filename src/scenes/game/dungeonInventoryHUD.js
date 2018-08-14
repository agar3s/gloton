import Scene from '../scene'
import gs from '../../config/gameStats'
import Item from '../../gameObjects/item'
import constants from '../../config/constants'

export default class DungeonInventoryHUDScene extends Scene {
  constructor () {
    super({key: 'dungeonInventoryHUDScene'})
  }

  create (params) {
    super.create(params)
    this.sceneManager.addGameScene(this.scene.key)
    this.registry.events.on('changedata', this.updateData, this)

    this.titleText.y += 40
    this.titleText.x += 40

    let graphics = this.add.graphics()
    graphics.fillStyle(0x1e1f30, 0.6)
    graphics.fillRect(0, 0, 320, 240)

    this.back = this.createButton({
      x: 280,
      y: 200,
      style: this.fonts.BM_kenneyMiniSquare,
      keyText: 'back',
      onClick: _ => {
        setTimeout(()=>{
          gs.stats.hud.inventoryOpen = false
        },200)
        this.close()
      }
    })

    this.container = this.add.container(50, 50)
    this.displayPage()
  }

  displayPage() {
    let items = gs.stats.inventory.items
    for (var j = 0; j < 12; j++) {
      for (var i = 0; i < 6; i++) {

        this.add.sprite(i*16, j*16, constants.ATLAS_KEY, 'ui/inv_cell_normal-empty')

        let itemprops = items[i + j*6]
        if(!itemprops) continue
        let keyFrame = itemprops.type
        if(keyFrame=='skeleton') {
          keyFrame = 'characters/npc/skeleton-resting-001'
        }else {
          keyFrame = `items/${itemprops.type}`
        }
        let sprite = new Item({
          scene: this,
          key: constants.ATLAS_KEY,
          frame: keyFrame,
          x: i*16,
          y: j*16,
          props: itemprops
        })
        this.container.add(sprite)
      }
    }
  }

  updateData (parent, key, data) {
  }
  
  // dont  call the super update function....
  update() {}

  updateLanguageTexts () {
    this.back.reloadText()
  }

}