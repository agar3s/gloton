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

    this.page = -1

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

    this.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setTint(0x9999ff)
      gameObject.setScale(1.2)
      if(gameObject.proItem){
        this.children.bringToTop(this.proContainer)
      }else{
        this.children.bringToTop(this.container)
      }
      this.container.bringToTop(gameObject)
    })

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX
      gameObject.y = dragY
    })
    this.input.on('dragend', (pointer, gameObject) => {
      gameObject.setScale(1)
      gameObject.clearTint()
      let coords = {
        i: ~~((gameObject.x+10)/20),
        j: ~~((gameObject.y+10 + (gameObject.proItem?10:0))/20)
      }
      
      if (gameObject.proItem) {
        this.handleRelocationProItem(gameObject, coords)
      } else {
        this.handleRelocationRegularItem(gameObject, coords)
      }

    })

    this.slots = []
    this.itemsDisplayed = []
    this.proItemsDisplayed = []
    this.proSlots = []
    this.createSlots()

    this.displayPage(0)

    this.description = this.add.bitmapText(
      180,
      60,
      this.fonts.BM_kenneyMiniSquare.font,
      '---'
    )
    this.description.setVisible(false)
  }

  handleRelocationRegularItem(item, coords){
    let offside = coords.i>5 || coords.j>6 || coords.i<0 || coords.j<0
    let newSlot = this.slots[coords.i + coords.j*6]
  
    // check if the new slot has space available
    if(offside){
      let insertedOk = false
      if(coords.i>0&&coords.i<5&&coords.j>6&&coords.j<9) {
        insertedOk = this.moveItemToSpecialContainer(coords.i-1, item)
      }
      if(!insertedOk){
        this.restoreItemLocation(item)
      }
      return
    } else if (!newSlot.availableSpace) {
      this.restoreItemLocation(item)
      return
    }
    this.moveItemInsideContainer(newSlot, coords, item)
  }

  handleRelocationProItem(item, coords){
    if(item.y<-20)coords.j = coords.j-1

    let offside = coords.i<1 || coords.i>4 ||coords.j!=0
    let newSlot = this.proSlots[coords.i-1]

    if(offside){
      let insertedOk = false
      if(coords.j>-8&&coords.j<0 && coords.i>=0&&coords.i<6) {
        insertedOk = this.moveItemToRegularContainer(coords, item)
      }
      if(!insertedOk){
        this.restoreItemLocation(item)
      }
    }else if(!newSlot.availableSpace){
      this.restoreItemLocation(item)
      return
    }
    this.restoreItemLocation(item)
    //coords.i-=1
    //this.moveItemInsideContainer(newSlot, coords, item, 'exclusive')
    //item.x += 20
  }

  moveItemInsideContainer(targetSlot, coords, item, slotType='normal') {
    // clean the previous slot
    let previousSlot = this.slots[item.coords.i + item.coords.j*6]
    previousSlot.availableSpace = true
    previousSlot.setFrame(`ui/inv_cell_${slotType}-empty`)
    
    // fill the newslot
    targetSlot.availableSpace = false
    targetSlot.setFrame(`ui/inv_cell_${slotType}-occuped`)

    // update the position coordinates on item
    item.x = coords.i*20
    item.y = coords.j*20
    item.coords = coords
  }

  moveItemToRegularContainer(coords, item) {
    coords.j = coords.j+7
    let index = coords.i + coords.j*6
    if(!this.slots[index].availableSpace) return false

    let previousSlot = this.proSlots[item.coords.i]
    previousSlot.availableSpace = true
    previousSlot.setFrame('ui/inv_cell_exclusive-empty')

    let indexToPut = index+(this.page*7*6)
    if(indexToPut>=this.itemsDisplayed.length){
      this.itemsDisplayed.push(item)
    }else{
      this.itemsDisplayed.splice(indexToPut, 0, item)
    }

    this.proContainer.remove(item)
    item.x = coords.i*20
    item.y = coords.j*20
    item.proItem = false
    item.coords = coords
    this.container.add(item)

    gs.stats.inventory.items.push(JSON.parse(JSON.stringify(item.props)))

    let exclusiveIndex = gs.stats.inventory.exclusive.indexOf(item.props)
    gs.stats.inventory.exclusive.splice(exclusiveIndex, 1)

    this.slots[index].availableSpace = false
    this.slots[index].setFrame('ui/inv_cell_normal-occuped')
    return true
  }

  moveItemToSpecialContainer(index, item){
    if(!this.proSlots[index].availableSpace) return false
    let previousSlot = this.slots[item.coords.i + item.coords.j*6]
    previousSlot.availableSpace = true
    previousSlot.setFrame('ui/inv_cell_normal-empty')

    let itemIndex = this.itemsDisplayed.indexOf(item)
    this.itemsDisplayed.splice(itemIndex, 1)

    this.container.remove(item)
    item.x = index*20 + 20
    item.y = 0
    item.coords = {i:index, j:0}
    item.proItem = true
    this.proContainer.add(item)

    gs.stats.inventory.exclusive.push(JSON.parse(JSON.stringify(item.props)))
    let mainIndex = gs.stats.inventory.items.indexOf(item.props)
    gs.stats.inventory.items.splice(mainIndex, 1)

    //
    this.proSlots[index].availableSpace = false
    this.proSlots[index].setFrame('ui/inv_cell_exclusive-occuped')

    return true
  }

  restoreItemLocation(item) {
    item.x = item.coords.i*20 + (item.proItem?20:0)
    item.y = item.coords.j*20
  }

  createSlots(){
    let items = gs.stats.inventory.items
    for (var j = 0; j < 7; j++) {
      for (var i = 0; i < 6; i++) {
        this.createSlot(i*20, j*20)
      }
    }
    for (var i = 0; i < 4; i++) {
      let proSlot = this.add.sprite(i*20 + 20, 0, constants.ATLAS_KEY, 'ui/inv_cell_exclusive-empty')
      proSlot.availableSpace = true

      this.proContainer.add(proSlot)
      this.proSlots.push(proSlot)

      let itemprops = gs.stats.inventory.exclusive[i]
      if(!itemprops){
        proSlot.availableSpace = true
        proSlot.setFrame('ui/inv_cell_exclusive-empty')
      }else{
        proSlot.availableSpace = false
        proSlot.setFrame('ui/inv_cell_exclusive-occuped')

        let keyFrame = itemprops.type
        let yOffset = 0
        if(keyFrame=='skeleton') {
          keyFrame = 'characters/npc/skeleton-resting-001'
          yOffset = 8
        }else {
          keyFrame = `items/${itemprops.type}`
        }
        let item = this.addItemToDisplay(i*20+20, yOffset, keyFrame, itemprops)
        item.coords = {
          i: i,
          j: 0
        }
        item.proItem = true
        this.proContainer.add(item)
      }
    }
    
  }

  displayPage(page) {
    if(page < 0) page = 0
    if(page === this.page) return
    this.page = page

    let items = gs.stats.inventory.items
    for (var i = 0; i < this.itemsDisplayed.length; i++) {
      this.itemsDisplayed[i].destroy()
    }
    this.itemsDisplayed = []

    for (var j = 0; j < 7; j++) {
      for (var i = 0; i < 6; i++) {
        let index = i + j*6
        let itemprops = items[(this.page*7*6) + index]
        let currentSlot = this.slots[index]
        if(!itemprops){
          currentSlot.availableSpace = true
          currentSlot.setFrame('ui/inv_cell_normal-empty')
          continue
        }
        currentSlot.availableSpace = false
        currentSlot.setFrame('ui/inv_cell_normal-occuped')

        let keyFrame = itemprops.type
        let yOffset = 0
        if(keyFrame=='skeleton') {
          keyFrame = 'characters/npc/skeleton-resting-001'
          yOffset = 8
        }else {
          keyFrame = `items/${itemprops.type}`
        }
        let item = this.addItemToDisplay(i*20, j*20+yOffset, keyFrame, itemprops)
        item.coords = {
          i: i,
          j: j
        }
        this.itemsDisplayed.push(item)
      }
    }
    this.container.add(this.itemsDisplayed)

  }

  addItemToDisplay(x, y, keyFrame, props) {
    let sprite = new Item({
      scene: this,
      key: constants.ATLAS_KEY,
      frame: keyFrame,
      x: x,
      y: y,
      props: props
    })
    sprite.setData('type', 'button')
    sprite.setInteractive(new Phaser.Geom.Rectangle(0, 0, sprite.width, sprite.height), Phaser.Geom.Rectangle.Contains)

    sprite.displayed = false
    sprite.onClick=()=>{}
    sprite.onHover=()=>{
      if(sprite.displayed) return
      sprite.displayed = true
      sprite.tint = 0xff66ff
      this.displayInfo(sprite)
    }
    sprite.onOut=()=>{
      if(!sprite.displayed) return
      sprite.displayed = false
      sprite.tint = 0xffffff
      this.hideInfo()
    }

    this.input.setDraggable(sprite)

    return sprite
  }

  createSlot(x, y) {
    //let slot = this.add.sprite(x, y, 'slots', 0)
    let slot = this.add.sprite(x, y, constants.ATLAS_KEY, 'ui/inv_cell_normal-empty')
    slot.setData('type', 'button')
    slot.setInteractive(new Phaser.Geom.Rectangle(0, 0, slot.width, slot.height), Phaser.Geom.Rectangle.Contains)
    slot.availableSpace = true
    slot.onClick=()=>{}
    slot.onHover=()=>{
      slot.tint = 0x66ffff
    }
    slot.onOut=()=>{
      slot.tint = 0xffffff
    }
    this.slots.push(slot)
    this.container.add(slot)
  }

  updateData (parent, key, data) {
  }
  
  // dont  call the super update function....
  update() {}

  updateLanguageTexts () {
    this.back.reloadText()
  }

  displayInfo(item) {

    let text = this.getText('mission_item_desc', [
      this.getText(`item_${item.props.typeKey}`),
      this.getText(`item_${item.props.special}`)
    ])
    this.description.setText(text)
    this.description.setVisible(true)
  }

  hideInfo() {
    this.description.setVisible(false)
  }

}