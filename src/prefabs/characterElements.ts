import { Action } from "./actions";

const GAME_WIDTH = 1280;
// const GAME_HEIGHT = 720;

const BuffType = ["Attack", "Defense", "Speed"];

export class Character {
  healthbar: HealthBar;
  actionbar: ActionBar;
  curBuff: Map<string, boolean>;
  curDebuff: Map<string, boolean>;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    w: number,
    h1: number,
    v1: number,
    h2: number,
    v2: number
  ) {
    this.healthbar = new HealthBar(scene, x, y - h1 / 2, w, h1, v1);
    this.actionbar = new ActionBar(scene, x, y + h2 / 2, w, h2, v2);
    this.curBuff = new Map();
    this.curDebuff = new Map();

    for (const type of BuffType) {
      this.curBuff.set(type, false);
      this.curDebuff.set(type, false);
    }
  }

  health(): number {
    return this.healthbar.getValue();
  }

  damage(amount: number) {
    let dmg = amount;
    if (this.hasDebuff("Defense")) {
      dmg = dmg * 1.5;
    }
    this.healthbar.decreaseBar(dmg);
  }

  heal(amount: number) {
    this.healthbar.increaseBar(amount);
  }

  setPosition(xPos: number, yPos: number) {
    const h1 = this.healthbar.background.height;
    const h2 = this.actionbar.background.height;

    this.healthbar.background.setPosition(xPos, yPos - h1 / 2);
    this.healthbar.valueBar.setPosition(xPos, yPos - h1 / 2);
    this.actionbar.background.setPosition(xPos, yPos + h2 / 2);
    this.actionbar.valueBar.setPosition(xPos, yPos + h2 / 2);
  }

  hasBuff(buff: string): boolean {
    if (!this.curBuff.has(buff)) {
      return false;
    }
    return this.curBuff.get(buff)!;
  }

  setBuff(buff: string) {
    if (!this.curBuff.has(buff)) {
      return;
    }
    this.curBuff.set(buff, true);

    setTimeout(() => {
      this.curDebuff.set(buff, false);
    }, 15000);
  }

  setDebuff(debuff: string) {
    if (!this.curDebuff.has(debuff)) {
      return;
    }
    this.curDebuff.set(debuff, true);

    setTimeout(() => {
      this.curDebuff.set(debuff, false);
    }, 15000);
  }

  hasDebuff(debuff: string): boolean {
    if (!this.curDebuff.has(debuff)) {
      return false;
    }
    return this.curDebuff.get(debuff)!;
  }

  draw() {
    this.healthbar.drawBar();
    this.actionbar.drawBar();
  }
}

export class Player extends Character {
  actions: Action[];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    w = 100,
    h1 = 20,
    v1 = 100,
    h2 = 10,
    v2 = 100
  ) {
    super(scene, x, y, w, h1, v1, h2, v2);
    this.actions = [];
  }

  isAlive(): boolean {
    return this.health() > 0;
  }

  addAction(action: Action) {
    this.actions.push(action);
  }

  passTurns() {
    for (const action of this.actions) {
      action.turnsPassed += 1;
    }
    this.resetAction();
  }

  setActRate(rate: number) {
    this.actionbar.setDecrementRate(rate);
  }

  canAct(): boolean {
    return this.actionbar.canAct();
  }

  resetAction() {
    this.actionbar.resetBar();
  }
}
export class Enemy extends Character {
  target: number;
  targetText: Phaser.GameObjects.Text;
  enemyLabel: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, maxHealth: number) {
    super(scene, GAME_WIDTH / 2, 60, 750, 30, maxHealth, 30, maxHealth);
    const enemy = scene.add.image(GAME_WIDTH / 2, 224, "dragon");
    enemy.setScale(0.5);

    this.target = Math.floor(4 * Math.random());

    this.targetText = scene.add.text(
      GAME_WIDTH / 2 - 348,
      70 - 8,
      `Intent: Claw Attack   Target: Player ${(this.target + 1).toString()}`,
      { font: "Ariel" }
    );

    this.targetText.setFontSize(28);
    this.targetText.setColor("Black");
    this.targetText.setFontStyle("bold");

    this.enemyLabel = scene.add.text(
      GAME_WIDTH / 2 - 348,
      40 - 8,
      `Enemy: Dragon`,
      { font: "Ariel" }
    );

    this.enemyLabel.setFontSize(28);
    this.enemyLabel.setColor("Black");
    this.enemyLabel.setFontStyle("bold");
  }

  selectTarget(allyParty: Player[], target: number = -1) {
    if (target > -1) {
      this.target = target;
      return;
    }

    let numAlliesDead = 0;
    for (const allies of allyParty) {
      if (!allies.isAlive()) {
        numAlliesDead += 1;
      }
    }

    if (numAlliesDead >= allyParty.length) {
      return;
    }

    this.target = Math.floor(Math.random() * 4);
    while (!allyParty[this.target].isAlive()) {
      this.target = Math.floor(Math.random() * 4);
    }
  }

  updateAction(allyParty: Player[]) {
    this.actionbar.decreaseBar(5);

    if (this.actionbar.getValue() <= 0) {
      if (this.hasDebuff("Attack")) {
        allyParty[this.target].damage(10);
      } else {
        allyParty[this.target].damage(20);
      }
      this.actionbar.resetBar();
      this.selectTarget(allyParty);
    }
  }

  draw() {
    super.draw();
    this.targetText.setText(
      `Intent: Claw Attack   Target: Player ${(this.target + 1).toString()}`
    );
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

export class HealthBar implements Bar {
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
    this.valueBar.width = (this.currentValue / this.maxValue) * this.maxWidth;
    if (this.valueBar.width < 0) {
      this.valueBar.width = 0;
    }
  }
}

export class ActionBar extends HealthBar {
  currentValue: number;
  decrementRate: number;

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
    this.decrementRate = 5;
  }

  canAct(): boolean {
    return this.currentValue <= 0;
  }

  setDecrementRate(n: number) {
    this.decrementRate = n;
  }

  update() {
    if (this.currentValue > 0) {
      this.decreaseBar(this.decrementRate);
      this.drawBar();
    }
  }
}
