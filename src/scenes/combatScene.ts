const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

const BUTTON_WIDTH = 200;
const BUTTON_HEIGHT = 100;

class Button extends Phaser.GameObjects.Rectangle {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    action: string,
    effect: () => void
  ) {
    super(scene, x, y, BUTTON_WIDTH, BUTTON_HEIGHT, 0xffffff);
    this.setInteractive();
    this.on("pointerdown", effect);
    console.log("added");

    scene.add.existing(this);

    const text = new Phaser.GameObjects.Text(
      scene,
      x - BUTTON_WIDTH / 2 + 12,
      y - 12,
      action,
      {
        font: "Ariel",
      }
    );
    text.setColor("black");
    text.setFontSize(32);
    scene.add.existing(text);
  }
}

class Bar extends Phaser.GameObjects.Rectangle {
  maxValue: number;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    color: number,
    maxLength: number,
    height: number
  ) {
    super(scene, x, y, maxLength, height, color);
    this.maxValue = maxLength;
    scene.add.existing(this);
  }

  decreaseBar(amount: number) {
    const newWidth = this.width - amount;
    this.setSize(newWidth, this.height);
  }

  increaseBar(amount: number) {
    const newWidth = this.width + amount;
    this.setSize(newWidth, this.height);
  }

  resetBar() {
    this.setSize(this.maxValue, this.height);
  }
}

export class Combat extends Phaser.Scene {
  enemyCooldown: Bar | null;
  enemyTarget: number;
  enemyIntent: Phaser.GameObjects.Text | null;
  allyHealth: Bar[];
  allyCooldown: Bar[];
  playerCanAttack: Boolean;

  constructor() {
    super("Combat");
    this.enemyCooldown = null;
    this.allyHealth = [];
    this.allyCooldown = [];
    this.playerCanAttack = true;
    this.enemyTarget = Math.floor(Math.random() * 4);
    this.enemyIntent = null;
  }

  preload() {}

  create() {
    this.drawUI();
    this.drawEnemy();
    this.drawPlayer();
    this.drawAllies();

    const enemyHealth = new Bar(this, GAME_WIDTH / 2, 50, 0xcc0000, 750, 25);
    this.enemyCooldown = new Bar(this, GAME_WIDTH / 2, 67.5, 0x33bbff, 750, 10);

    for (let i = 1; i < 5; i++) {
      const health = new Bar(
        this,
        (i * GAME_WIDTH) / 5,
        GAME_HEIGHT - GAME_HEIGHT / 3 - 30,
        0xcc0000,
        100,
        15
      );
      this.allyHealth.push(health);
    }

    for (let i = 1; i < 5; i++) {
      const cooldown = new Bar(
        this,
        (i * GAME_WIDTH) / 5,
        GAME_HEIGHT - GAME_HEIGHT / 3 - 20,
        0x33bbff,
        100,
        5
      );
      this.allyCooldown.push(cooldown);
    }

    this.allyCooldown[0].decreaseBar(100);

    const test = new Button(
      this,
      GAME_WIDTH / 4,
      GAME_HEIGHT - BUTTON_HEIGHT / 2 - 10,
      "Attack",
      () => {
        if (this.playerCanAttack) {
          enemyHealth.decreaseBar(50);
          this.playerCanAttack = false;
          this.allyCooldown[0].resetBar();
        }
      }
    );
  }

  update() {
    this.updateEnemyAttack(this.enemyCooldown!, this.allyHealth);
    this.updatePlayerAttack(this.allyCooldown[0]);
  }

  enemySelectAllies() {
    this.enemyTarget = Math.floor(Math.random() * 4);
    while (this.allyHealth[this.enemyTarget].width <= 0) {
      this.enemyTarget = Math.floor(Math.random() * 4);
    }
  }

  updateEnemyAttack(attackBar: Bar, allyParty: Bar[]) {
    attackBar.decreaseBar(5);

    if (attackBar.width <= 0) {
      allyParty[this.enemyTarget].decreaseBar(10);
      attackBar.resetBar();
      this.enemySelectAllies();
      this.enemyIntent?.setText((this.enemyTarget + 1).toString());
    }
  }

  updatePlayerAttack(attackBar: Bar) {
    if (attackBar.width > 0) {
      attackBar.decreaseBar(1);
    } else {
      this.playerCanAttack = true;
    }
  }

  drawEnemy() {
    const enemy = this.add.image(GAME_WIDTH / 2, 200, "dragon");
    this.add.rectangle(GAME_WIDTH / 2, 55.25, 750, 35, 0x4d4d4d);
    enemy.setScale(0.5);

    this.enemyIntent = this.add.text(
      GAME_WIDTH / 4,
      GAME_HEIGHT / 3,
      (this.enemyTarget + 1).toString(),
      { font: "Ariel" }
    );

    this.enemyIntent.setFontSize(128);
    this.enemyIntent.setColor("Black");
  }

  drawUI() {
    this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0xffe6cc
    );

    this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT - GAME_HEIGHT / 12,
      GAME_WIDTH,
      GAME_HEIGHT / 6,
      0xe6e6e6
    );

    for (let i = 1; i < 5; i++) {
      this.add.rectangle(
        (i * GAME_WIDTH) / 5,
        GAME_HEIGHT - GAME_HEIGHT / 3 - 27.5,
        100,
        20,
        0x4d4d4d
      );
    }
  }

  drawAllies() {
    for (let i = 0; i < 3; i++) {
      this.add.rectangle(
        (2 * GAME_WIDTH) / 5 + i * (GAME_WIDTH / 5),
        GAME_HEIGHT - GAME_HEIGHT / 4,
        100,
        100,
        0x79a6d2
      );
    }

    for (let i = 0; i < 4; i++) {
      const text = this.add.text(
        GAME_WIDTH / 5 + i * (GAME_WIDTH / 5) - 36,
        GAME_HEIGHT - GAME_HEIGHT / 4 - 56,
        (i + 1).toString(),
        { font: "Ariel" }
      );
      text.setFontSize(128);
      text.setColor("black");
    }
  }

  drawPlayer() {
    this.add.rectangle(
      GAME_WIDTH / 5,
      GAME_HEIGHT - GAME_HEIGHT / 4,
      100,
      100,
      0x00cccc
    );
  }
}
