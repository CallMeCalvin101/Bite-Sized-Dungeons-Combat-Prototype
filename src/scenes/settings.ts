import * as Phaser from 'phaser';

export class Settings extends Phaser.Scene {
  english: any;
  not_english: any;
  language: any;

  constructor() {
    super('settings');
  }

  preload() {
    this.load.json("english", "en.json");
    this.load.json("not_english", "lang.json");
  }

  create() {
    this.cameras.main.setBackgroundColor(0x141413);
    const center_x = this.game.canvas.width / 2;
    const center_y = this.game.canvas.height / 2;
    
    this.english = this.cache.json.get('english');
    this.not_english = this.cache.json.get('not_english');
    this.setLanguage(); // set language
    
    const settings_intro = this.add.text(center_x, center_y, this.language.settings, { fontFamily: 'Silkscreen', color: '#D3B02C', fontSize: '60px'}).setOrigin(0.5);
    
    const english_settings = this.add.text(center_x, center_y - 80, 'English', { fontFamily: 'Silkscreen', color: '#D3B02C', fontSize: '35px'}).setOrigin(0.5);
    english_settings.setInteractive();
    english_settings.on('pointerover', () => { english_settings.setColor('#FFF'); });
    english_settings.on('pointerout', () => { english_settings.setColor('#D3B02C'); });
    english_settings.on('pointerdown', () => { 
      localStorage.setItem('language', 'english');
      this.scene.start('team');
    });
    
    const other_settings = this.add.text(center_x, center_y - 40, 'Not English', { fontFamily: 'Silkscreen', color: '#D3B02C', fontSize: '35px'}).setOrigin(0.5);
    other_settings.setInteractive();
    other_settings.on('pointerover', () => { other_settings.setColor('#FFF'); });
    other_settings.on('pointerout', () => { other_settings.setColor('#D3B02C'); });
    other_settings.on('pointerdown', () => { 
      localStorage.setItem('language', 'not_english');
      this.scene.start('team');
    });

    this.tweens.add({ 
      targets: [settings_intro],
      y: center_y - 175,
      duration: 2000,
      ease: 'Power2',
    });


    const back_button = this.add.text(center_x, center_y + 300, '←', { fontFamily: 'Bangers', color: '#D3B02C', fontSize: '85px'}).setOrigin(0.5);
    back_button.setInteractive();
    back_button.on('pointerover', () => { back_button.setColor('#FFF'); });
    back_button.on('pointerout', () => { back_button.setColor('#E5A90A'); });
    back_button.on('pointerdown', () => { this.scene.start('menu'); });
  }

  setLanguage() {
    if(localStorage.getItem('language')!) { 
    let get_lang = localStorage.getItem('language')!;
    if(get_lang === 'not_english') {
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
