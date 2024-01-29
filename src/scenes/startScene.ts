export class Start extends Phaser.Scene {
  constructor() {
    super("Start");
  }

  preload() {
    this.load.image("dragon", "dragon.png");
  }

  create() {
    console.log("Start");
    this.input.on("pointerdown", () => {
      this.scene.start("Combat");
    });

    this.add.rectangle(1280 / 2, 720 / 2, 1280, 720, 0xe6e6e6);

    const info = this.add.text(
      1280 / 2 - 360,
      720 / 2 - 120,
      ["Bite Sized Dungeon\nCore Game Loop\nPrototype", "Click to Start"],
      { font: "Ariel" }
    );

    info.setColor("black");
    info.setFontSize(64);
  }

  update() {}
}
