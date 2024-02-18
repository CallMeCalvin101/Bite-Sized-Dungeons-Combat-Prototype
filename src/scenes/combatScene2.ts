import { Enemy, Player } from "../prefabs/characterElements";
import { TargetAllyAction, TargetEnemyAction } from "../prefabs/actions";
import { skillList } from "../prefabs/skills";

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

export class Combat2 extends Phaser.Scene {
  player: Player | null;
  playerHealthText: Phaser.GameObjects.Text | null;
  skillDescription: Phaser.GameObjects.Text | null;
  allies: Player[];
  enemy: Enemy | null;

  dimUI: Phaser.GameObjects.Rectangle | null;

  constructor() {
    super("Combat2");

    this.player = null;
    this.playerHealthText = null;
    this.skillDescription = null;
    this.allies = [];
    this.enemy = null;
    this.dimUI = null;
  }

  preload() {}

  create() {
    this.drawBackground();
    this.initializeUI();
    this.initializePlayer();
    this.initializeAllies();
    this.enemy = new Enemy(this, 750);
    this.initializeActions();
  }

  update() {
    this.drawCharacters();
    this.drawSkills();
    this.player?.actionbar.update();
    this.enemy?.updateAction(this.allies);
    this.drawUI();

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

  initializeActions() {
    this.player?.addAction(
      new TargetEnemyAction(
        this,
        this.skillDescription!,
        GAME_WIDTH / 4,
        GAME_HEIGHT - 60,
        this.player,
        skillList.get(`attack`)!,
        this.enemy!
      )
    );

    this.player?.addAction(
      new TargetEnemyAction(
        this,
        this.skillDescription!,
        (3 * GAME_WIDTH) / 4,
        GAME_HEIGHT - 60,
        this.player,
        skillList.get(`dual strikes`)!,
        this.enemy!,
        5
      )
    );

    this.player?.addAction(
      new TargetAllyAction(
        this,
        this.skillDescription!,
        GAME_WIDTH / 2,
        GAME_HEIGHT - 60,
        this.player,
        skillList.get(`heal`)!,
        this.allies
      )
    );

    this.dimUI = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 50,
      GAME_WIDTH,
      100,
      0x000000,
      0.2
    );
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

  initializeUI() {
    this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 50,
      GAME_WIDTH,
      100,
      0xe6e6e6
    );

    this.skillDescription = this.add.text(40, GAME_HEIGHT - 22, ``);
    this.skillDescription.setFontSize("20px");
    this.skillDescription.setFontStyle("bold");
    this.skillDescription.setColor("black");
  }

  drawSkills() {
    for (const action of this.player?.actions!) {
      action.draw();
    }
  }

  drawUI() {
    if (this.player?.canAct()) {
      this.dimUI!.alpha = 0;
      console.log(true);
    } else {
      this.dimUI!.alpha = 1;
    }
  }

  endGame() {
    this.scene.start("End");
  }
}
