const BUTTON_WIDTH = 200;
const BUTTON_HEIGHT = 100;

class Button extends Phaser.GameObjects.Rectangle {
  constructor(scene: Phaser.Scene, x: number, y: number, effect: () => void) {
    super(scene, x, y, BUTTON_WIDTH, BUTTON_HEIGHT, 0xffffff);
    this.setInteractive();
    this.on("pointerdown", effect);
    console.log("added");

    scene.add.existing(this);
  }
}

export class Combat extends Phaser.Scene {
  constructor() {
    super("Combat");
  }

  preload() {}

  create() {
    this.add.rectangle(1080 / 2, 780 / 2, 1080, 780, 0xe6e6e6);
    console.log("Combat");
    const test = new Button(this, 540, 390, () => {
      console.log("clicked");
    });
  }

  update() {}
}
