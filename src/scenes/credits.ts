import * as Phaser from 'phaser';
import englishURL from '/assets/en.json?url';
import notEnglishURL from '/assets/lang.json?url';

export class Credits extends Phaser.Scene {
  english: any;
  not_english: any;
  language: any;

  constructor() {
    super('credits');
  }

  preload() {
    this.load.json('english', englishURL);
    this.load.json('not_english', notEnglishURL);
  }

  create() {
    this.cameras.main.setBackgroundColor(0x141413);
    const center_x = this.game.canvas.width / 2;
    const center_y = this.game.canvas.height / 2;
    
    this.english = this.cache.json.get('english');
    this.not_english = this.cache.json.get('not_english');
    this.setLanguage(); // set language
    
    const team_name_str = "Programmer - Christian Perez\n Music - Louis Lim\n";

    this.add.text(center_x, center_y, team_name_str, { fontFamily: 'Bangers' ,color: '#D3B02C', fontSize: '35px'}).setOrigin(0.5);
    const credits_intro = this.add.text(center_x, center_y, this.language.credits, { fontFamily: 'Silkscreen', color: '#D3B02C', fontSize: '60px'}).setOrigin(0.5);

    this.tweens.add({ 
      targets: [credits_intro],
      y: center_y - 300,
      duration: 2000,
      ease: 'Power2',
    });

    const back_button = this.add.text(center_x, center_y + 300, '←', { fontFamily: 'Bangers', color: '#D3B02C', fontSize: '85px'}).setOrigin(0.5);
    back_button.setInteractive();
    back_button.on('pointerover', () => { back_button.setColor('#FFF'); });
    back_button.on('pointerout', () => { back_button.setColor('#D3B02C'); });
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
}