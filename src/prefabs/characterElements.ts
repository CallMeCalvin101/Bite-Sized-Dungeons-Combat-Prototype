const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const BUTTON_WIDTH = 200;
const BUTTON_HEIGHT = 50;

export enum SkillType {
  TargetEnemy,
  TargetAlly,
}

export interface Skill {
  name: string;
  type: SkillType;
  description: string;
  actRate: number;
  effect(target: HealthBar): void;
}

class Action extends Phaser.GameObjects.Rectangle {
  cooldown: number;
  turnsPassed: number;
  skill: Skill;
  player: Player;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Player,
    skill: Skill,
    cd = 0
  ) {
    super(scene, x, y, BUTTON_WIDTH, BUTTON_HEIGHT, 0xffffff);
    this.cooldown = cd;
    this.turnsPassed = this.cooldown;
    this.player = player;
    this.skill = skill;

  
    scene.add.existing(this);

    const text = new Phaser.GameObjects.Text(
      scene,
      x - BUTTON_WIDTH / 2 + 12,
      y - 12,
      this.skill.name,
      {
        font: "Ariel",
      }
    );

    text.setColor("black");
    text.setFontSize(32);
    scene.add.existing(text);
  }

  draw() {
    if (this.cooldown - this.turnsPassed <= 0) {
      this.setFillStyle(0xffffff);
    } else {
      this.setFillStyle(0x888888);
    }
  }
}

export class TargetEnemyAction extends Action {
  enemy: Enemy;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Player,
    skill: Skill,
    enemy: Enemy,
    cd = 0
  ) {
    super(scene, x, y, player, skill, cd);
    this.enemy = enemy;

    this.setInteractive();
    this.on("pointerdown", () => {
      if (this.cooldown - this.turnsPassed <= 0 && this.player.canAct()) {
        this.skill.effect(this.enemy.healthbar);
        this.turnsPassed = 0;
        this.player!.setActRate(this.skill.actRate);
        this.player.passTurns();
      }
    });
  }

  setEnemy(enemy: Enemy) {
    this.enemy = enemy;
  }
}

function addAllyTargeting(
  scene: Phaser.Scene,
  action: TargetAllyAction,
  fn: (healthbar: HealthBar) => void
) {
  // Draws invisable box for player to click and exit the command
  const removeTargetClickBox = scene.add.rectangle(
    GAME_WIDTH / 2,
    GAME_HEIGHT / 2,
    GAME_WIDTH,
    GAME_HEIGHT,
    0xffffff,
    0
  );

  action.alliesHitbox.push(removeTargetClickBox);

  //Draws a transparent box over all players to parse the targeted command
  const playerClickbox = scene.add.rectangle(
    GAME_WIDTH / 2,
    GAME_HEIGHT - 50,
    GAME_WIDTH,
    100,
    0xffffff,
    0.5
  );

  action.alliesHitbox.push(playerClickbox);

  for (let i = 1; i < 4; i++) {
    const allyClickbox = scene.add.rectangle(
      (GAME_WIDTH * i) / 4,
      GAME_HEIGHT - GAME_HEIGHT / 3,
      100,
      100,
      0xffffff,
      0.5
    );
    action.alliesHitbox.push(allyClickbox);
  }

  // Adds the functionality to the parsed function
  for (let i = 0; i < action.party.length; i++) {
    action.alliesHitbox[i + 1].setInteractive();
    action.alliesHitbox[i + 1].on("pointerdown", () => {
      fn(action.party[i]!.healthbar);
      action.turnsPassed = 0;
      action.player!.setActRate(action.skill.actRate);
      action.player.passTurns();
      action.destroyAllBoxes();
    });
  }

  action.alliesHitbox[0].setInteractive();
  action.alliesHitbox[0].on("pointerdown", () => {
    action.destroyAllBoxes();
  });
}

export class TargetAllyAction extends Action {
  alliesHitbox: Phaser.GameObjects.Rectangle[];
  party: Player[];
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Player,
    skill: Skill,
    party: Player[],
    cd = 0
  ) {
    super(scene, x, y, player, skill, cd);
    this.party = party;
    this.alliesHitbox = [];

    this.setInteractive();
    this.on("pointerdown", () => {
      if (this.cooldown - this.turnsPassed <= 0 && this.player.canAct()) {
        addAllyTargeting(scene, this, this.skill.effect);
      }
    });
  }

  destroyAllBoxes() {
    for (const box of this.alliesHitbox) {
      box.destroy();
    }
    this.alliesHitbox = [];
  }
}

class Character {
  healthbar: HealthBar;
  actionbar: ActionBar;

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
  }

  health(): number {
    return this.healthbar.getValue();
  }

  damage(amount: number) {
    this.healthbar.decreaseBar(amount);
  }

  setPosition(xPos: number, yPos: number) {
    const h1 = this.healthbar.background.height;
    const h2 = this.actionbar.background.height;

    this.healthbar.background.setPosition(xPos, yPos - h1 / 2);
    this.healthbar.valueBar.setPosition(xPos, yPos - h1 / 2);
    this.actionbar.background.setPosition(xPos, yPos + h2 / 2);
    this.actionbar.valueBar.setPosition(xPos, yPos + h2 / 2);
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

  constructor(scene: Phaser.Scene, maxHealth: number) {
    super(scene, GAME_WIDTH / 2, 60, 750, 40, maxHealth, 20, maxHealth);
    const enemy = scene.add.image(GAME_WIDTH / 2, 200, "dragon");
    enemy.setScale(0.5);

    this.target = Math.floor(4 * Math.random());

    this.targetText = scene.add.text(
      GAME_WIDTH / 2 - 348,
      70 - 8,
      `TARGET: ${(this.target + 1).toString()}`,
      { font: "Ariel" }
    );

    this.targetText.setFontSize(18);
    this.targetText.setColor("Black");
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
      allyParty[this.target].damage(20);
      this.actionbar.resetBar();
      this.selectTarget(allyParty);
    }
  }

  draw() {
    super.draw();
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
