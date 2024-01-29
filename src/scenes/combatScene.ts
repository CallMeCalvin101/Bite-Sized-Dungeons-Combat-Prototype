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
    let newWidth = this.width + amount;
    if (newWidth > this.maxValue) {
      newWidth = this.maxValue;
    }
    this.setSize(newWidth, this.height);
  }

  resetBar() {
    this.setSize(this.maxValue, this.height);
  }
}

export class Combat extends Phaser.Scene {
  enemyHealth: Bar | null;
  enemyCooldown: Bar | null;
  enemyTarget: number;
  enemyIntent: Phaser.GameObjects.Text | null;
  allyHealth: Bar[];
  allyCooldown: Bar[];
  allyCDRate: number[];

  playerCanAttack: Boolean;
  skillAction: Button | null;
  canAttackSkill: Boolean;
  healAction: Button | null;
  isSelectingHeal: Boolean;
  numActionTaken: number;
  alliedTarget: number;
  highlightBox: Phaser.GameObjects.Rectangle[];

  constructor() {
    super("Combat");

    this.enemyHealth = null;
    this.enemyCooldown = null;
    this.allyHealth = [];
    this.allyCooldown = [];
    this.playerCanAttack = true;
    this.enemyTarget = Math.floor(Math.random() * 4);
    this.enemyIntent = null;
    this.allyCDRate = [1, 1, 1, 1];
    this.skillAction = null;
    this.canAttackSkill = true;
    this.numActionTaken = 0;
    this.alliedTarget = -1;
    this.healAction = null;
    this.isSelectingHeal = false;
    this.highlightBox = [];
  }

  preload() {}

  create() {
    this.drawUI();
    this.drawEnemy();
    this.drawPlayer();
    this.drawAllies();

    this.enemyHealth = new Bar(this, GAME_WIDTH / 2, 50, 0xcc0000, 750, 25);
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

    const attackAction = new Button(
      this,
      GAME_WIDTH / 4,
      GAME_HEIGHT - BUTTON_HEIGHT / 2 - 10,
      "Attack",
      () => {
        if (this.playerCanAttack) {
          this.enemyHealth!.decreaseBar(5);
          this.playerCanAttack = false;
          this.allyCDRate[0] = 1.5;
          this.numActionTaken += 1;
          this.allyCooldown[0].resetBar();
          this.isSelectingHeal = false;
        }
      }
    );

    this.add.existing(attackAction);

    this.skillAction = new Button(
      this,
      (3 * GAME_WIDTH) / 4,
      GAME_HEIGHT - BUTTON_HEIGHT / 2 - 10,
      "Dual Strike",
      () => {
        if (this.playerCanAttack) {
          this.enemyHealth!.decreaseBar(15);
          this.playerCanAttack = false;
          this.allyCooldown[0].resetBar();
          this.allyCDRate[0] = 0.75;
          this.numActionTaken = 0;
          this.canAttackSkill = false;
          this.isSelectingHeal = false;

          setTimeout(() => {
            this.enemyHealth!.decreaseBar(30);
          }, 200);
        }
      }
    );

    this.healAction = new Button(
      this,
      GAME_WIDTH / 2,
      GAME_HEIGHT - BUTTON_HEIGHT / 2 - 10,
      "Heal",
      () => {
        if (this.playerCanAttack) {
          this.isSelectingHeal = true;
        }
      }
    );
  }

  parseHeal(target: number) {
    this.isSelectingHeal = false;
    this.allyHealth[target].increaseBar(50);
    this.playerCanAttack = false;
    this.allyCDRate[0] = 0.5;
    this.numActionTaken += 1;
    this.allyCooldown[0].resetBar();
  }

  update() {
    this.updateEnemyAttack(this.enemyCooldown!, this.allyHealth);
    this.updatePlayerAttack(this.allyCooldown[0]);
    this.updateAlliesAttack(
      this.allyCooldown,
      this.allyCDRate,
      this.enemyHealth!
    );

    if (this.enemyHealth!.width <= 0 || this.allyHealth[0].width <= 0) {
      this.endGame();
    }
  }

  enemySelectAllies() {
    let numAlliesDead = 0;
    for (const allies of this.allyHealth) {
      if (allies.width <= 0) {
        numAlliesDead += 1;
      }
    }

    if (numAlliesDead >= this.allyHealth.length) {
      return;
    }

    this.enemyTarget = Math.floor(Math.random() * 4);
    while (this.allyHealth[this.enemyTarget].width <= 0) {
      this.enemyTarget = Math.floor(Math.random() * 4);
    }
  }

  updateEnemyAttack(attackBar: Bar, allyParty: Bar[]) {
    attackBar.decreaseBar(5);

    if (attackBar.width <= 0) {
      allyParty[this.enemyTarget].decreaseBar(20);
      attackBar.resetBar();
      this.enemySelectAllies();
      this.enemyIntent?.setText((this.enemyTarget + 1).toString());
    }
  }

  updatePlayerAttack(attackBar: Bar) {
    if (attackBar.width > 0) {
      attackBar.decreaseBar(this.allyCDRate[0]);
    } else {
      this.playerCanAttack = true;
    }

    if (this.canAttackSkill) {
      this.skillAction!.setFillStyle(0xffffff);
    } else {
      this.skillAction!.setFillStyle(0x8c8c8c);
    }

    if (this.numActionTaken >= 3) {
      this.canAttackSkill = true;
    }

    if (this.isSelectingHeal) {
      this.healAction!.setFillStyle(0xb3ffd7);
      for (const box of this.highlightBox) {
        box.setAlpha(0.5);
      }
    } else {
      this.healAction!.setFillStyle(0xffffff);
      for (const box of this.highlightBox) {
        box.setAlpha(0);
      }
    }
  }

  updateAlliesAttack(attackBars: Bar[], cooldownRates: number[], enemy: Bar) {
    for (let i = 1; i < 4; i++) {
      if (attackBars[i].width > 0) {
        attackBars[i].decreaseBar(cooldownRates[i]);
      } else {
        enemy.decreaseBar(1 * (5 - cooldownRates[i]));
        attackBars[i].resetBar();
        cooldownRates[i] = Math.floor(Math.random() * 4 + 1);
      }
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
      const box = this.add.rectangle(
        (i + 1) * (GAME_WIDTH / 5),
        GAME_HEIGHT - GAME_HEIGHT / 4,
        100,
        100,
        0xffffff,
        1
      );
      this.highlightBox.push(box);
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
      text.on("pointerdown", () => {
        if (this.isSelectingHeal) {
          this.parseHeal(i);
        }
        this.alliedTarget = i;
      });
      text.setInteractive();
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

  endGame() {
    this.scene.start("End");
  }
}
