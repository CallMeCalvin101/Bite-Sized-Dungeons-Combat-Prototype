export class Start extends Phaser.Scene {
  constructor() {
    super("Start");
  }

  preload() {}

  create() {
    console.log("Start");
    this.input.on("pointerdown", () => {
      this.scene.start("Combat");
    });
  }

  update() {}
}
