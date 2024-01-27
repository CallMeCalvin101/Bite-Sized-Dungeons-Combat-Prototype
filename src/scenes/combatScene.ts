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
  allyHealth: Bar[];

  constructor() {
    super("Combat");
    this.enemyCooldown = null;
    this.allyHealth = [];
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

    const test = new Button(
      this,
      GAME_WIDTH / 4,
      GAME_HEIGHT - BUTTON_HEIGHT / 2 - 10,
      "Attack",
      () => {
        enemyHealth.decreaseBar(50);
      }
    );
  }

  update() {
    this.updateEnemyAttack(this.enemyCooldown!, this.allyHealth);
  }

  updateEnemyAttack(attackBar: Bar, allyParty: Bar[]) {
    attackBar.decreaseBar(5);

    if (attackBar.width <= 0) {
      allyParty[Math.floor(Math.random() * 4)].decreaseBar(10);
      attackBar.resetBar();
    }
  }

  drawEnemy() {
    const enemy = this.add.image(GAME_WIDTH / 2, 200, "dragon");
    enemy.setScale(0.5);
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
