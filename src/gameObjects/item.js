
export default class Item {
	constructor(params) {
    this.scene = params.scene

    this.sprite = this.scene.physics.add
      .sprite(params.x, params.y, 'box', 0)
  }

  update() {
    this.sprite.update()
  }
}