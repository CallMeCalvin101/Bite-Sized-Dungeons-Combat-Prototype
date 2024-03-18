const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

const TEXT_COLOR = "#D3B02C";
const FONT = "Silkscreen";

export class Start extends Phaser.Scene {
  english: any;
  not_english: any;
  language: any;

  constructor() {
    super("Start");
  }

  preload() {
    this.load.image("dragon", "dragon.png");
    this.load.image("dragonLogo", "8_bit_dragon.png");
    this.load.json("english", "en.json");
    this.load.json("not_english", "lang.json");
    this.load.audio("btnHov", "btn_hover.mp3");
  }

  create() {
    const hover = this.sound.add("btnHov");
    this.english = this.cache.json.get("english");
    this.not_english = this.cache.json.get("not_english");
    this.setLanguage(); // set language
    console.log("Start");

    this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x141413
    );

    this.add
      .text(GAME_WIDTH / 2, 80, "Select A Class", {
        fontFamily: "Silkscreen",
        color: "#D3B02C",
        fontSize: "55px",
      })
      .setOrigin(0.5);

    const dragon_image = this.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 175 + 100, "dragonLogo")
      .setScale(0.35)
      .setOrigin(0.5);

    this.tweens.add({
      targets: [dragon_image],
      y: GAME_HEIGHT / 2 - 170 + 100,
      duration: 1500,
      ease: "Power2",
      yoyo: true,
      repeat: -1,
    });

    const class1 = this.add
      .text(GAME_WIDTH / 3, GAME_HEIGHT / 2 + 100, "All-Rounder", {
        fontFamily: FONT,
        color: TEXT_COLOR,
        fontSize: "40px",
      })
      .setOrigin(0.5);
    class1.setInteractive();
    class1.on("pointerover", () => {
      class1.setColor("#FFF");
      hover.play();
    });
    class1.on("pointerout", () => {
      class1.setColor(TEXT_COLOR);
    });
    class1.on("pointerdown", () => {
      localStorage.setItem("playerClass", "class 1");
      this.scene.start("Combat2");
    });

    const class2 = this.add
      .text(GAME_WIDTH / 3, GAME_HEIGHT / 2 + 225, "Bruiser", {
        fontFamily: FONT,
        color: TEXT_COLOR,
        fontSize: "40px",
      })
      .setOrigin(0.5);
    class2.setInteractive();
    class2.on("pointerover", () => {
      class2.setColor("#FFF");
      hover.play();
    });
    class2.on("pointerout", () => {
      class2.setColor(TEXT_COLOR);
    });
    class2.on("pointerdown", () => {
      localStorage.setItem("playerClass", "class 2");
      this.scene.start("Combat2");
    });

    const class3 = this.add
      .text((GAME_WIDTH * 2) / 3, GAME_HEIGHT / 2 + 100, "Striker", {
        fontFamily: FONT,
        color: TEXT_COLOR,
        fontSize: "40px",
      })
      .setOrigin(0.5);
    class3.setInteractive();
    class3.on("pointerover", () => {
      class3.setColor("#FFF");
      hover.play();
    });
    class3.on("pointerout", () => {
      class3.setColor(TEXT_COLOR);
    });
    class3.on("pointerdown", () => {
      localStorage.setItem("playerClass", "class 3");
      this.scene.start("Combat2");
    });

    const class4 = this.add
      .text((GAME_WIDTH * 2) / 3, GAME_HEIGHT / 2 + 225, "Supporter", {
        fontFamily: FONT,
        color: TEXT_COLOR,
        fontSize: "40px",
      })
      .setOrigin(0.5);
    class4.setInteractive();
    class4.on("pointerover", () => {
      class4.setColor("#FFF");
      hover.play();
    });
    class4.on("pointerout", () => {
      class4.setColor(TEXT_COLOR);
    });
    class4.on("pointerdown", () => {
      localStorage.setItem("playerClass", "class 4");
      this.scene.start("Combat2");
    });
  }

  setLanguage() {
    if (localStorage.getItem("language")!) {
      let get_lang = localStorage.getItem("language")!;
      if (get_lang === "not_english") {
        this.language = this.not_english;
      } else {
        this.language = this.english;
      }
    } else {
      this.language = this.english;
    }
  }

  update() {}
}
