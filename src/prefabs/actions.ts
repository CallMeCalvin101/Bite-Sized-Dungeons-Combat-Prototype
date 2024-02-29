import { Skill } from "./skills";
import { Player, Enemy, Character } from "./characterElements";

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

const BUTTON_WIDTH = 200;
const BUTTON_HEIGHT = 50;

const ALLY_TARGET_COLOR = 0x00ff15;

export class Action extends Phaser.GameObjects.Rectangle {
  cooldown: number;
  turnsPassed: number;
  skill: Skill;
  player: Player;
  constructor(
    scene: Phaser.Scene,
    description: Phaser.GameObjects.Text,
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
    this.setInteractive();

    this.on("pointerover", () => {
      if (this.player.canAct()) {
        description.setText(this.skill.description);
      }
    });

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

  isUsable(): boolean {
    if (this.cooldown - this.turnsPassed <= 0 && this.player.canAct()) {
      return true;
    }
    return false;
  }
}

export class TargetEnemyAction extends Action {
  enemy: Enemy;

  constructor(
    scene: Phaser.Scene,
    description: Phaser.GameObjects.Text,
    x: number,
    y: number,
    player: Player,
    skill: Skill,
    enemy: Enemy,
    cd = 0
  ) {
    super(scene, description, x, y, player, skill, cd);
    this.enemy = enemy;

    this.on("pointerdown", () => {
      if (this.cooldown - this.turnsPassed <= 0 && this.player.canAct()) {
        this.skill.effect(this.player, this.enemy);
        this.player!.setActRate(this.skill.actRate);
        //JANK TIMEOUT TO FIX LATER
        setTimeout(() => {
          this.player.passTurns();
          this.turnsPassed = 0;
        }, 10);
      }
    });
  }

  setEnemy(enemy: Enemy) {
    this.enemy = enemy;
  }
}

export class TargetAllyAction extends Action {
  alliesHitbox: Phaser.GameObjects.Rectangle[];
  party: Player[];
  constructor(
    scene: Phaser.Scene,
    description: Phaser.GameObjects.Text,
    x: number,
    y: number,
    player: Player,
    skill: Skill,
    party: Player[],
    cd = 0
  ) {
    super(scene, description, x, y, player, skill, cd);
    this.party = party;
    this.alliesHitbox = [];

    this.on("pointerdown", () => {
      if (this.cooldown - this.turnsPassed <= 0 && this.player.canAct()) {
        addAllyTargeting(scene, this, player, this.skill.effect);
        description.setText(
          "Click on any green box to use skill on ally, click elsewhere to cancel"
        );
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

function addAllyTargeting(
  scene: Phaser.Scene,
  action: TargetAllyAction,
  source: Player,
  fn: (start: Player, target: Character) => void
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
    ALLY_TARGET_COLOR,
    0.375
  );

  action.alliesHitbox.push(playerClickbox);

  for (let i = 1; i < 4; i++) {
    const allyClickbox = scene.add.rectangle(
      (GAME_WIDTH * i) / 4,
      GAME_HEIGHT - GAME_HEIGHT / 3,
      100,
      100,
      ALLY_TARGET_COLOR,
      0.375
    );
    action.alliesHitbox.push(allyClickbox);
  }

  // Adds the functionality to the parsed function
  for (let i = 0; i < action.party.length; i++) {
    action.alliesHitbox[i + 1].setInteractive();
    action.alliesHitbox[i + 1].on("pointerdown", () => {
      fn(source, action.party[i]!);
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

export class AllAllyAction extends Action {
  alliesHitbox: Phaser.GameObjects.Rectangle[];
  party: Player[];
  constructor(
    scene: Phaser.Scene,
    description: Phaser.GameObjects.Text,
    x: number,
    y: number,
    player: Player,
    skill: Skill,
    party: Player[],
    cd = 0
  ) {
    super(scene, description, x, y, player, skill, cd);
    this.party = party;
    this.alliesHitbox = [];

    this.on("pointerdown", () => {
      if (this.cooldown - this.turnsPassed <= 0 && this.player.canAct()) {
        this.on("pointerdown", () => {
          if (this.cooldown - this.turnsPassed <= 0 && this.player.canAct()) {
            for (const ally of party) {
              this.skill.effect(this.player, ally);
            }
            this.turnsPassed = 0;
            this.player!.setActRate(this.skill.actRate);
            this.player.passTurns();
          }
        });
      }
    });
  }
}
