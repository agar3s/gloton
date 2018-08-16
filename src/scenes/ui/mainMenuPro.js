import Scene from '../scene'
import getDataManager from '../../managers/dataManager'
import gs from '../../config/gameStats'
import constants from '../../config/constants'
import tunner from '../../utils/tunner'

export default class MainMenuProScene extends Scene {
  constructor() {
    super({ key: 'mainMenuProScene' })
  }

  create(params) {
    super.create(params)

    //this.add.image(0, 0, 'titleBackground').setOrigin(0)
    this.add.image(0, 0, 'fondo_pantalla_inicio').setOrigin(0)

    let x = 18
    let y = 15
    
    // first line
    let a = this.add.image(x-1, y, 'title_the_legend_of').setOrigin(0)

    // second line
    y = a.y + a.height + 3
    let b = this.add.image(x, y, 'title_the').setOrigin(0)

    // third line
    y = b.y + b.height + 2
    let c = this.add.image(x, y, 'title_looter').setOrigin(0)
    x = c.x + c.width + 5
    let d = this.add.image(x, y, 'title_and').setOrigin(0)
    d.y = c.y+c.height-d.height - 1

    // fourth line
    x = 19
    y = c.y + c.height + 2
    let e = this.add.image(x, y, 'title_the_2').setOrigin(0)
    x = e.x + e.width + 5
    let f = this.add.image(x, y, 'title_incredible').setOrigin(0)
    // fifth line
    x = 18
    y = e.y + e.height + 2
    let g = this.add.image(x, y, 'title_backpack').setOrigin(0)
    
    // sixth line
    x = 63
    y = g.y + g.height + 2
    let h = this.add.image(x, y+3, 'title_that').setOrigin(0)
    x = h.x + h.width + 4
    let i = this.add.image(x, y, 'title_never').setOrigin(0)
    x = i.x + i.width + 5
    let j = this.add.image(x, y, 'title_runs').setOrigin(0)
    // seventh line
    x = 94
    y = j.y + j.height + 2
    let k = this.add.image(x, y+5, 'title_out_of').setOrigin(0)
    x = k.x + k.width + 3
    let l = this.add.image(x, y, 'title_space').setOrigin(0)

    

    let arrayOfTitles = [a,b,c,d,e,f,g,h,i,j,k,l]
    arrayOfTitles.forEach(title=>{
      title.setVisible(false)
    })
    setTimeout(()=>{
      a.setVisible(true)
    },1000)
    setTimeout(()=>{
      b.setVisible(true)
    },1800)
    setTimeout(()=>{
      c.setVisible(true)
    },2200)
    setTimeout(()=>{
      d.setVisible(true)
    },2600)
    setTimeout(()=>{
      e.setVisible(true)
    },3000)
    setTimeout(()=>{
      f.setVisible(true)
    },3400)
    setTimeout(()=>{
      g.setVisible(true)
    },3800)
    setTimeout(()=>{
      h.setVisible(true)
    },4400)
    setTimeout(()=>{
      i.setVisible(true)
    },4800)
    setTimeout(()=>{
      j.setVisible(true)
    },5200)
    setTimeout(()=>{
      k.setVisible(true)
    },5600)
    setTimeout(()=>{
      l.setVisible(true)
    },5800)
    
    let ninjaPreview = this.add.image(320, 160, 'ninja_pantalla_inicio').setOrigin(0)
    setTimeout(()=>{
      this.tweens.add({
        targets: ninjaPreview,
        props: {
          x: { value: 0, duration: 700, ease: 'Linear' }
        }
      })
    }, 6300)

    this.events.on('shutdown', _ => this.shutdown(), this)

    this.buttonSelect = this.sound.add('fx_button_select')

    // you can set your button with a custom behaviour
    // by default, onHover and onOut events just tint
    // the sprite
    // font key is the default font family set up in the
    // base "Scene" file.
    this.startShadow = this.add.bitmapText(
      this.cameras.main.width / 2,
      200,
      this.fonts.BM_kenneyMiniSquare.font,
      this.getText('start'),
      16
    )
    this.startShadow.x+=1
    this.startShadow.y+=1
    this.startShadow.tint = 0x0
    this.start = this.createButton({
      x: this.cameras.main.width / 2,
      y: 200,
      style: this.fonts.BM_kenneyMiniSquare,
      size: 16,
      text: this.getText('start'),
      color: 0xffff00,
      onClick: (self) => {
        this.buttonSelect.play()
        this.changeToScene('tutorialScene')
        self.x+=1
        self.y+=1
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
      x: 200,
      y: 230,
      keyText: 'credits',
      style: this.fonts.BM_kenneyMiniSquare,
      size: 8,
      onClick: _ => {
        this.open('creditsScene')
        //gs.stats.permanentObjects.mainMusic.stop()
      }
    })

    

    this.setLanguageButton = this.createButton({
      x: 250,
      y: 230,
      keyText: 'language',
      style: this.fonts.BM_kenneyMiniSquare,
      size: 8,
      onClick: (self) => {
        this.translator.changeLanguage()
        this.updateLanguageTexts()
      }
    })


    //this.start.setVisible(false)
    //this.setLanguageButton.setVisible(false)
    //this.credits.setVisible(false)

    setTimeout(()=>{
      this.start.setVisible(true)
      this.setLanguageButton.setVisible(true)
      this.credits.setVisible(true)
    }, 7000)

    this.add.bitmapText(
      100,
      230,
      this.fonts.BM_kenneyMiniSquare.font,
      '2018 - LUDUM DARE 48',
      8
    )

  }

  updateLanguageTexts () {
    this.start.setText( this.getText('start') )
    this.credits.reloadText()
    this.setLanguageButton.reloadText()
  }

  shutdown() {
    this.events.off('shutdown')
    //gs.stats.permanentObjects.mainMusic.stop()
  }

}