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

    this.page = 0

    this.nextPage = this.createButton({
      x: 165,
      y: 50,
      style: this.fonts.BM_kenneyMiniSquare,
      text: 'next->',
      onClick: _ => {
        this.displayPage(this.page+1)
      }
    })

    this.backPage = this.createButton({
      x: 165,
      y: 35,
      style: this.fonts.BM_kenneyMiniSquare,
      text: '<- back',
      onClick: _ => {
        this.displayPage(this.page-1)
      }
    })

    this.container = this.add.container(50, 50)
    this.proContainer = this.add.container(50, 200)
    this.itemsDisplayed = []
    this.createSlots()

    this.displayPage(0)
  }

  createSlots(){
    let items = gs.stats.inventory.items
    for (var j = 0; j < 7; j++) {
      for (var i = 0; i < 6; i++) {
        //this.add.sprite(i*16, j*16, constants.ATLAS_KEY, 'ui/inv_cell_normal-empty')
        let slot = this.add.sprite(i*20, j*20, 'slots', 0)
        this.container.add(slot)
      }
    }
    for (var i = 0; i < 4; i++) {
      let proSlot = this.add.sprite(i*20 + 20, 0, 'slots', 1)
      this.proContainer.add(proSlot)
    }
  }

  displayPage(page) {
    this.page = page
    if(this.page < 0) this.page = 0

    let items = gs.stats.inventory.items
    for (var i = 0; i < this.itemsDisplayed.length; i++) {
      this.itemsDisplayed[i].destroy()
    }
    this.itemsDisplayed = []

    for (var j = 0; j < 7; j++) {
      for (var i = 0; i < 6; i++) {

        let itemprops = items[(this.page*7*6) + i + j*6]
        if(!itemprops) continue
        let keyFrame = itemprops.type
        let yOffset = 0
        if(keyFrame=='skeleton') {
          keyFrame = 'characters/npc/skeleton-resting-001'
          yOffset = 8
        }else {
          keyFrame = `items/${itemprops.type}`
        }
        let sprite = new Item({
          scene: this,
          key: constants.ATLAS_KEY,
          frame: keyFrame,
          x: i*20,
          y: j*20 + yOffset,
          props: itemprops
        })
        this.itemsDisplayed.push(sprite)
      }
    }
    this.container.add(this.itemsDisplayed)

  }

  updateData (parent, key, data) {
  }
  
  // dont  call the super update function....
  update() {}

  updateLanguageTexts () {
    this.back.reloadText()
  }

}