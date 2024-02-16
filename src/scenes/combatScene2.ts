import { Enemy, HealthBar, Player } from "../prefabs/characterElements";
import { skillList } from "../prefabs/skills";

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

const BUTTON_WIDTH = 200;
const BUTTON_HEIGHT = 50;

class Button extends Phaser.GameObjects.Rectangle {
  cooldown: number;
  turnsPassed: number;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    action: string,
    effect: () => void,
    cd = 0
  ) {
    super(scene, x, y, BUTTON_WIDTH, BUTTON_HEIGHT, 0xffffff);
    this.cooldown = cd;
    this.turnsPassed = this.cooldown;

    this.setInteractive();
    this.on("pointerdown", () => {
      if (this.cooldown - this.turnsPassed <= 0) {
        effect();
        this.turnsPassed = 0;
      }
    });
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

  draw() {
    if (this.cooldown - this.turnsPassed <= 0) {
      this.setFillStyle(0xffffff);
    } else {
      this.setFillStyle(0x888888);
    }
  }
}

export class Combat2 extends Phaser.Scene {
  player: Player | null;
  playerHealthText: Phaser.GameObjects.Text | null;
  allies: Player[];
  alliesHitbox: Phaser.GameObjects.Rectangle[];
  skills: Button[];
  enemy: Enemy | null;
  system = {
    isTargetingAlly: false,
  };

  constructor() {
    super("Combat2");

    this.player = null;
    this.playerHealthText = null;
    this.allies = [];
    this.alliesHitbox = [];
    this.skills = [];
    this.enemy = null;
  }

  preload() {}

  create() {
    this.drawBackground();
    this.drawUI();
    this.initializeSkills();
    this.initializePlayer();
    this.initializeAllies();

    this.enemy = new Enemy(this, 750);
  }

  update() {
    this.drawCharacters();
    this.drawSkills();
    this.player?.actionbar.update();
    this.enemy?.updateAction(this.allies);

    if (!this.player?.isAlive() || this.enemy!.health() <= 0) {
      this.endGame();
    }
  }

  initializePlayer() {
    this.player = new Player(
      this,
      GAME_WIDTH / 2,
      GAME_HEIGHT - 10 - 100,
      GAME_WIDTH,
      30,
      100,
      10,
      100
    );
    this.allies.push(this.player);
    this.player.setActRate(1);

    this.playerHealthText = this.add.text(
      40,
      GAME_HEIGHT - 10 - 100 - 22,
      `${this.player.health()}/${this.player.healthbar.maxValue}`
    );
    this.playerHealthText.setFontSize("20px");
    this.playerHealthText.setFontStyle("bold");
    this.playerHealthText.setColor("black");

    this.player.addSkill(skillList.get("heal")!);
    this.player.addSkill(skillList.get("dual strikes")!);
  }

  initializeAllies() {
    for (let i = 1; i < 4; i++) {
      const ally = new Player(
        this,
        (GAME_WIDTH * i) / 4,
        GAME_HEIGHT - GAME_HEIGHT / 3 - 75
      );
      this.allies.push(ally);

      this.add.rectangle(
        (GAME_WIDTH * i) / 4,
        GAME_HEIGHT - GAME_HEIGHT / 3,
        100,
        100,
        0x79a6d2
      );

      const text = this.add.text(
        (GAME_WIDTH * i) / 4 - 40,
        GAME_HEIGHT - GAME_HEIGHT / 3 - 56,
        `${i + 1}`
      );
      text.setFontSize(128);
      text.setColor("black");
    }

    console.log(this.allies.length);
  }

  initializeSkills() {
    this.skills.push(
      new Button(this, GAME_WIDTH / 4, GAME_HEIGHT - 60, "Attack", () => {
        if (this.player?.canAct()) {
          this.enemy?.damage(5);
          this.player.setActRate(1.5);
          this.passTurns();
        }
      })
    );

    this.skills.push(
      new Button(
        this,
        (3 * GAME_WIDTH) / 4,
        GAME_HEIGHT - 60,
        "Dual Strike",
        () => {
          if (this.player?.canAct()) {
            this.player.getSkill("dual strikes").effect(this.enemy!.healthbar);
            this.player.setActRate(0.75);
            this.passTurns();
          }
        },
        5
      )
    );

    this.skills.push(
      new Button(this, GAME_WIDTH / 2, GAME_HEIGHT - 60, "Heal", () => {
        if (this.player?.canAct()) {
          this.targetAlly(this.player.getSkill("heal").effect);
        }
      })
    );
  }

  passTurns() {
    for (const skill of this.skills) {
      skill.turnsPassed += 1.5;
    }
    this.player!.resetAction();
  }

  drawBackground() {
    this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0xffe6cc
    );
  }

  drawCharacters() {
    this.enemy?.draw();
    this.player?.draw();
    this.playerHealthText?.setText(
      `${this.player!.health()}/${this.player!.healthbar.maxValue}`
    );
    for (const ally of this.allies) {
      ally.draw();
    }
  }

  drawUI() {
    this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 50,
      GAME_WIDTH,
      100,
      0xe6e6e6
    );
  }

  drawSkills() {
    for (const skill of this.skills) {
      skill.draw();
    }
  }

  destroyAllBoxes() {
    for (const box of this.alliesHitbox) {
      box.destroy();
    }
    this.alliesHitbox = [];
  }

  targetAlly(fn: (healthbar: HealthBar) => void) {
    const removeTargetClickBox = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0xffffff,
      0
    );
    this.alliesHitbox.push(removeTargetClickBox);

    const playerClickbox = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 50,
      GAME_WIDTH,
      100,
      0xffffff,
      0.5
    );

    this.alliesHitbox.push(playerClickbox);

    for (let i = 1; i < 4; i++) {
      const allyClickbox = this.add.rectangle(
        (GAME_WIDTH * i) / 4,
        GAME_HEIGHT - GAME_HEIGHT / 3,
        100,
        100,
        0xffffff,
        0.5
      );
      this.alliesHitbox.push(allyClickbox);
    }

    for (let i = 0; i < this.allies.length; i++) {
      this.alliesHitbox[i + 1].setInteractive();
      this.alliesHitbox[i + 1].on("pointerdown", () => {
        fn(this.allies[i]!.healthbar);
        this.player!.setActRate(0.5);
        this.passTurns();

        this.destroyAllBoxes();
      });
    }

    this.alliesHitbox[0].setInteractive();
    this.alliesHitbox[0].on("pointerdown", () => {
      this.destroyAllBoxes();
    });
  }

  endGame() {
    this.scene.start("End");
  }
}
