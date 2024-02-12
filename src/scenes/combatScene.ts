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

class Enemy {
  healthBar: HealthBar;
  attackBar: AttackBar;
  target: number;
  targetText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, maxHealth: number) {
    this.healthBar = new HealthBar(
      scene,
      GAME_WIDTH / 2,
      60,
      750,
      40,
      maxHealth
    );

    this.attackBar = new AttackBar(
      scene,
      GAME_WIDTH / 2,
      80,
      750,
      20,
      maxHealth
    );

    this.target = Math.floor(4 * Math.random());

    this.targetText = scene.add.text(
      GAME_WIDTH / 2 - 348,
      80 - 8,
      `TARGET: ${(this.target + 1).toString()}`,
      { font: "Ariel" }
    );

    this.targetText.setFontSize(18);
    this.targetText.setColor("Black");
  }

  getHealth(): number {
    return this.healthBar.getValue();
  }

  damage(amount: number) {
    this.healthBar.decreaseBar(amount);
  }

  selectTarget(allyParty: HealthBar[], target: number = -1) {
    if (target > -1) {
      this.target = target;
      return;
    }

    let numAlliesDead = 0;
    for (const allies of allyParty) {
      if (allies.getValue() <= 0) {
        numAlliesDead += 1;
      }
    }

    if (numAlliesDead >= allyParty.length) {
      return;
    }

    this.target = Math.floor(Math.random() * 4);
    while (allyParty[this.target].getValue() <= 0) {
      this.target = Math.floor(Math.random() * 4);
    }
  }

  updateAttackBar(allyParty: HealthBar[]) {
    this.attackBar.decreaseBar(5);

    if (this.attackBar.getValue() <= 0) {
      allyParty[this.target].decreaseBar(20);
      this.attackBar.resetBar();
      this.selectTarget(allyParty);
    }
  }

  draw(scene: Phaser.Scene) {
    this.healthBar.drawBar();
    this.attackBar.drawBar();

    const enemy = scene.add.image(GAME_WIDTH / 2, 200, "dragon");
    enemy.setScale(0.5);

    this.targetText.setText(`TARGET: ${(this.target + 1).toString()}`);
  }
}

interface Bar {
  valueBar: Phaser.GameObjects.Rectangle;
  background: Phaser.GameObjects.Rectangle;
  maxWidth: number;
  maxValue: number;
  currentValue: number;

  decreaseBar(amount: number): void;
  increaseBar(amount: number): void;
  resetBar(): void;
  getValue(): number;
  drawBar(): void;
}

class HealthBar implements Bar {
  valueBar: Phaser.GameObjects.Rectangle;
  background: Phaser.GameObjects.Rectangle;
  maxWidth: number;
  maxValue: number;
  currentValue: number;

  constructor(
    scene: Phaser.Scene,
    xPos: number,
    yPos: number,
    width: number,
    height: number,
    maxValue: number
  ) {
    this.background = new Phaser.GameObjects.Rectangle(
      scene,
      xPos,
      yPos,
      width,
      height,
      0xbab4b4
    );

    this.valueBar = new Phaser.GameObjects.Rectangle(
      scene,
      xPos,
      yPos,
      width,
      height,
      0xf42c2c
    );

    scene.add.existing(this.background);
    scene.add.existing(this.valueBar);

    this.maxWidth = width;
    this.maxValue = maxValue;
    this.currentValue = maxValue;
  }

  decreaseBar(amount: number) {
    this.currentValue -= amount;
  }

  increaseBar(amount: number) {
    this.currentValue += amount;
    if (this.currentValue > this.maxValue) {
      this.currentValue = this.maxValue;
    }
  }

  resetBar() {
    this.currentValue = this.maxValue;
  }

  getValue(): number {
    return this.currentValue;
  }

  drawBar() {
    this.valueBar.width = (this.currentValue / this.maxValue) * this.maxValue;
    if (this.valueBar.width < 0) {
      this.valueBar.width = 0;
    }
  }
}

class AttackBar extends HealthBar {
  currentValue: number;
  decrementAmount: number;

  constructor(
    scene: Phaser.Scene,
    xPos: number,
    yPos: number,
    width: number,
    height: number,
    maxValue: number
  ) {
    super(scene, xPos, yPos, width, height, maxValue);
    this.valueBar.setFillStyle(0x23cbf8);
    this.currentValue = maxValue;
    this.decrementAmount = 5;
  }

  canAttack(): boolean {
    return this.currentValue <= 0;
  }

  update() {
    if (this.currentValue > 0) {
      this.decreaseBar(this.decrementAmount);
      this.drawBar();
    }
  }
}

export class Combat extends Phaser.Scene {
  enemy: Enemy | null;
  allyHealth: HealthBar[];
  allyCooldown: AttackBar[];
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

    this.enemy = null;
    this.allyHealth = [];
    this.allyCooldown = [];
    this.playerCanAttack = true;
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
    this.drawPlayer();
    this.drawAllies();

    this.enemy = new Enemy(this, 750);

    for (let i = 1; i < 5; i++) {
      const health = new HealthBar(
        this,
        (i * GAME_WIDTH) / 5,
        GAME_HEIGHT - GAME_HEIGHT / 3 - 30,
        100,
        15,
        100
      );
      this.allyHealth.push(health);
    }

    for (let i = 1; i < 5; i++) {
      const cooldown = new AttackBar(
        this,
        (i * GAME_WIDTH) / 5,
        GAME_HEIGHT - GAME_HEIGHT / 3 - 20,
        100,
        5,
        100
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
          this.enemy?.damage(5);
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
          this.enemy?.damage(15);
          this.playerCanAttack = false;
          this.allyCooldown[0].resetBar();
          this.allyCDRate[0] = 0.75;
          this.numActionTaken = 0;
          this.canAttackSkill = false;
          this.isSelectingHeal = false;

          setTimeout(() => {
            this.enemy?.damage(30);
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
    this.enemy?.draw(this);
    this.updatePlayerAttack(this.allyCooldown[0]);
    this.updateAlliesAttack(
      this.allyCooldown,
      this.allyCDRate,
      this.enemy?.healthBar!
    );

    this.enemy?.updateAttackBar(this.allyHealth);

    if (
      this.enemy!.healthBar.getValue() <= 0 ||
      this.allyHealth[0].getValue() <= 0
    ) {
      this.endGame();
    }

    this.drawBars();
  }

  updatePlayerAttack(attackBar: Bar) {
    if (attackBar.getValue() > 0) {
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
      if (attackBars[i].getValue() > 0) {
        attackBars[i].decreaseBar(cooldownRates[i]);
      } else {
        enemy.decreaseBar(1 * (5 - cooldownRates[i]));
        attackBars[i].resetBar();
        cooldownRates[i] = Math.floor(Math.random() * 4 + 1);
      }

      attackBars[i].drawBar();
    }
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

  drawBars() {
    for (let i = 0; i < 4; i++) {
      this.allyHealth[i].drawBar();
      this.allyCooldown[i].drawBar();
    }
  }

  endGame() {
    this.scene.start("End");
  }
}
