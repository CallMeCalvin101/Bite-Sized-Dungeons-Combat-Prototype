export class Start extends Phaser.Scene {
  constructor() {
    super("Start");
  }

  preload() {
    this.load.image("dragon", "../dragon.png");
  }

  create() {
    console.log("Start");
    this.input.on("pointerdown", () => {
      this.scene.start("Combat");
    });
  }

  update() {}
}
