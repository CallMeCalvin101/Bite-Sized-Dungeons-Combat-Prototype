import * as Phaser from "phaser";

export class Team extends Phaser.Scene {
  // supported languages
  english: any;
  korean: any;
  not_english: any;
  language: any;

  constructor() {
    super("team");
  }

  preload() {
    this.load.json("english", "en.json");
    this.load.json("not_english", "lang.json");
    this.load.json("korean", "kr.json");
    this.load.audio("menuBGM", "byte_menu.mp3");
  }

  create() {
    const bgm = this.sound.add("menuBGM");
    this.sound.stopByKey("menuBGM");
    this.english = this.cache.json.get("english");
    this.not_english = this.cache.json.get("not_english");
    this.korean = this.cache.json.get("korean");
    this.setLanguage(); // set language

    this.cameras.main.setBackgroundColor(0x141413);
    const center_x = this.game.canvas.width / 2;
    const center_y = this.game.canvas.height / 2;

    const team_intro = this.add
      .text(center_x, center_y, this.language.team_name, {
        fontFamily: "Silkscreen",
        color: "#D3B02C",
        fontSize: "50px",
      })
      .setOrigin(0.5);
    const game_name = this.add
      .text(center_x, center_y - 80, "Bite-Sized Dungeons", {
        fontFamily: "Silkscreen",
        color: "#D3B02C",
        fontSize: "55px",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: [game_name],
      y: center_y - 175,
      duration: 2000,
      ease: "Power2",
      yoyo: true,
      repeat: -1,
    });

    this.tweens.add({
      targets: [game_name, team_intro],
      alpha: 0,
      duration: 4000,
      onComplete: () => {
        bgm.setLoop(true);
        bgm.play();
        this.scene.start("menu", { music: bgm });
      },
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

  update() {
    // game logic here
  }
}
