import * as Phaser from "phaser";

export class Menu extends Phaser.Scene {
  english: any;
  not_english: any;
  korean: any;
  language: any;

  constructor() {
    super("menu");
  }

  preload() {
    this.load.image("dragonLogo", "8_bit_dragon.png");
    this.load.json("english", "en.json");
    this.load.json("not_english", "lang.json");
    this.load.json("korean", "kr.json");
    this.load.audio("btnHov", "btn_hover.mp3");
  }

  create() {
    this.cameras.main.setBackgroundColor(0x141413); // sets background color change later
    const hover = this.sound.add("btnHov");
    this.english = this.cache.json.get("english");
    this.not_english = this.cache.json.get("not_english");
    this.korean = this.cache.json.get("korean");
    this.setLanguage(); // set language

    const center_x = this.game.canvas.width / 2;
    const center_y = this.game.canvas.height / 2;

    const game_name = this.add
      .text(center_x, center_y - 80, "Bite-Sized Dungeons", {
        fontFamily: "Silkscreen",
        color: "#D3B02C",
        fontSize: "55px",
      })
      .setOrigin(0.5);
    //const title_image = this.add.image(center_x, center_y - 80, 'title').setScale(.75).setOrigin(0.5);
    const dragon_image = this.add
      .image(center_x, center_y - 175 + 100, "dragonLogo")
      .setScale(0.35)
      .setOrigin(0.5)
      .setVisible(false);
    // sets title in place
    this.tweens.add({
      targets: [game_name],
      y: center_y - 385 + 100,
      duration: 3000,
      ease: "Power2",
      onComplete: () => {
        dragon_image.setVisible(true);
      },
    });

    this.tweens.add({
      targets: [dragon_image],
      y: center_y - 170 + 100,
      duration: 1500,
      ease: "Power2",
      yoyo: true,
      repeat: -1,
    });

    const join_button = this.add
      .text(center_x, center_y + 150, this.language.join_room, {
        fontFamily: "Silkscreen",
        color: "#D3B02C",
        fontSize: "35px",
      })
      .setOrigin(0.5);
    join_button.setInteractive();
    join_button.on("pointerover", () => {
      join_button.setColor("#FFF");
      hover.play();
    });
    join_button.on("pointerout", () => {
      join_button.setColor("#D3B02C");
    });
    join_button.on("pointerdown", () => {
      this.scene.start("Start");
    });

    const settings_button = this.add
      .text(center_x, center_y + 200, this.language.settings, {
        fontFamily: "Silkscreen",
        color: "#D3B02C",
        fontSize: "35px",
      })
      .setOrigin(0.5);
    settings_button.setInteractive();
    settings_button.on("pointerover", () => {
      settings_button.setColor("#FFF");
      hover.play();
    });
    settings_button.on("pointerout", () => {
      settings_button.setColor("#D3B02C");
    });
    settings_button.on("pointerdown", () => {
      this.scene.start("settings");
    });

    const credits_button = this.add
      .text(center_x, center_y + 250, this.language.credits, {
        fontFamily: "Silkscreen",
        color: "#D3B02C",
        fontSize: "35px",
      })
      .setOrigin(0.5);
    credits_button.setInteractive();
    credits_button.on("pointerover", () => {
      credits_button.setColor("#FFF");
      hover.play();
    });
    credits_button.on("pointerout", () => {
      credits_button.setColor("#D3B02C");
    });
    credits_button.on("pointerdown", () => {
      this.scene.start("credits");
    });
  }

  setLanguage() {
    if(localStorage.getItem('language')!) { 
      let get_lang = localStorage.getItem('language')!;
      if(get_lang === 'not_english') {
          this.language = this.not_english;
      } else if(get_lang === 'korean') {
          this.language = this.korean;
      } else {
          this.language = this.english;
      }
    } else {
    this.language = this.english;
    }
  }

  update() {}
}
