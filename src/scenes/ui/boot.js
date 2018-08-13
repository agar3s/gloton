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
    this.load.bitmapFont(this.fonts.BM_kenneyMini.font, urlBase + 'assets/fonts/KenneyMini-8px_0.png', urlBase + 'assets/fonts/KenneyMini-8px.fnt')
    this.load.bitmapFont(this.fonts.BM_kenneyMiniSquare.font, urlBase + 'assets/fonts/KenneyMiniSquare-8px_0.png', urlBase + 'assets/fonts/KenneyMiniSquare-8px.fnt')

    // load ui assets
    this.load.spritesheet('timer', urlBase + 'assets/timer.png', { frameWidth: 41, frameHeight: 32 })
    this.load.spritesheet('ninja', urlBase + 'assets/ninja.png', { frameWidth: 28, frameHeight: 29 })
    this.load.spritesheet('mapa', urlBase + 'assets/mapa.png', { frameWidth: 27, frameHeight: 28 })
    this.load.spritesheet('life', urlBase + 'assets/life.png', { frameWidth: 21, frameHeight: 19 })
    this.load.spritesheet('backpack', urlBase + 'assets/backpack.png', { frameWidth: 27, frameHeight: 28 })
    

    // prototype assets
    this.load.spritesheet('player', urlBase + 'assets/player_test.png', { frameWidth: 16, frameHeight: 16 })
    this.load.spritesheet('cursor', urlBase + 'assets/cursor.png', { frameWidth: 9, frameHeight: 9 })
    this.load.spritesheet('hand', urlBase + 'assets/hand.png', { frameWidth: 5, frameHeight: 5 })
    this.load.spritesheet('box', urlBase + 'assets/box.png', { frameWidth: 16, frameHeight: 16 })

    // load audio
    this.load.audio('fx_door_open', urlBase+'assets/audio/fx/Door_Open.ogg')
    this.load.audio('fx_hook_return_01', urlBase+'assets/audio/fx/Hook_Return_01.ogg')
    this.load.audio('fx_hook_shot_01', urlBase+'assets/audio/fx/Hook_Shot_01.ogg')
    this.load.audio('fx_impact_fail_01', urlBase+'assets/audio/fx/Impact_HookFail_01.ogg')
    this.load.audio('fx_impact_fail_02', urlBase+'assets/audio/fx/Impact_HookFail_02.ogg')
    this.load.audio('fx_impact_skeleton_01', urlBase+'assets/audio/fx/Impact_Skeleton_01.ogg')
    this.load.audio('fx_impact_skeleton_02', urlBase+'assets/audio/fx/Impact_Skeleton_02.ogg')
    this.load.audio('fx_impact_stone_01', urlBase+'assets/audio/fx/Impact_Stone_01.ogg')
    this.load.audio('fx_impact_stone_02', urlBase+'assets/audio/fx/Impact_Stone_02.ogg')
    this.load.audio('fx_impact_metal_01', urlBase+'assets/audio/fx/Impact_Metal_01.ogg')
    this.load.audio('fx_impact_metal_02', urlBase+'assets/audio/fx/Impact_Metal_02.ogg')
    this.load.audio('fx_impact_crystal_01', urlBase+'assets/audio/fx/Impact_Crystal_01.ogg')
    this.load.audio('fx_impact_crystal_02', urlBase+'assets/audio/fx/Impact_Crystal_02.ogg')
    this.load.audio('fx_impact_wood_01', urlBase+'assets/audio/fx/Impact_Wood_01.ogg')
    this.load.audio('fx_impact_wood_02', urlBase+'assets/audio/fx/Impact_Wood_02.ogg')
    // load json
    this.load.json('translations', urlBase + 'assets/texts.json')

    // fake loader
    if (this.constants.FAKE_LOADER_ACTIVE) {
      for (var i = 0; i < 500; i++) {
        this.load.spritesheet(`logo-${i}`, urlBase + 'assets/phaserLogo.png', { frameWidth: 382, frameHeight: 331 })
      }
    }

    // load the atlas with all the sprites for the game
    this.load.multiatlas(
      this.constants.ATLAS_KEY,
      `assets/atlas/${this.constants.ATLAS_KEY}.json`,
      'assets/atlas'
    );

    // load the JSONs and sprites for the levels
    this.load.image('tilesMaze01', 'assets/levels/tiles_maze01.png');
    this.load.tilemapTiledJSON('mapMaze01', 'assets/levels/tilemap_maze01.json');
  }
}