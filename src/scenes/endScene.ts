export class End extends Phaser.Scene {
    constructor() {
      super("End");
    }
  
    preload() {
    }
  
    create() {
      this.add.rectangle(1280 / 2, 720 / 2, 1280, 720, 0xe6e6e6);
      
      const info = this.add.text(
        1280 / 2 - 420,
        720 / 2 - 120,
        ["Thanks for playtesting\nRefresh the page \nto restart the game"],
        { font: "Ariel" }
      );
  
      info.setColor("black")
      info.setFontSize(64)
    }
  
    update() {}
  }