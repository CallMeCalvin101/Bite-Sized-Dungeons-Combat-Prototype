import { Enemy, Player, Character } from "../prefabs/characterElements";
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
  enemyDefenseStatus: Phaser.GameObjects.Text | null;
  enemyAttackStatus: Phaser.GameObjects.Text | null;
  allyBuffStatus: Phaser.GameObjects.Text | null;

  constructor() {
    super("Combat2");

    this.player = null;
    this.playerHealthText = null;
    this.skillDescription = null;
    this.allies = [];
    this.enemy = null;
    this.dimUI = null;
    this.enemyDefenseStatus = null;
    this.enemyAttackStatus = null;
    this.allyBuffStatus = null;
  }

  preload() {}

  create() {
    this.drawBackground();
    this.initializeUI();
    this.initializePlayer();
    this.initializeAllies();
    this.enemy = new Enemy(this, 2000);

    this.enemyDefenseStatus = this.add.text(
      GAME_WIDTH / 2 - 48 + 72,
      60,
      `DEF DOWN`
    );
    this.enemyDefenseStatus.setFontSize("20px");
    this.enemyDefenseStatus.setFontStyle("bold");
    this.enemyDefenseStatus.setColor("black");

    this.enemyAttackStatus = this.add.text(
      GAME_WIDTH / 2 - 48 - 72,
      60,
      `ATK DOWN`
    );
    this.enemyAttackStatus.setFontSize("20px");
    this.enemyAttackStatus.setFontStyle("bold");
    this.enemyAttackStatus.setColor("black");

    this.allyBuffStatus = this.add.text(
      GAME_WIDTH / 2 - 48,
      GAME_HEIGHT - 100 - 32,
      `ATK UP`
    );
    this.allyBuffStatus.setFontSize("20px");
    this.allyBuffStatus.setFontStyle("bold");
    this.allyBuffStatus.setColor("black");

    this.initializeActions();
  }

  update() {
    this.drawCharacters();
    this.drawSkills();
    this.player?.actionbar.update();
    this.enemy?.updateAction(this.allies);
    this.simulateAllies();
    this.drawUI();

    if (this.enemy?.hasDebuff("Defense")) {
      this.enemyDefenseStatus!.alpha = 1;
    } else {
      this.enemyDefenseStatus!.alpha = 0;
    }

    if (this.enemy?.hasDebuff("Attack")) {
      this.enemyAttackStatus!.alpha = 1;
    } else {
      this.enemyAttackStatus!.alpha = 0;
    }

    if (this.player?.hasBuff("Attack")) {
      this.allyBuffStatus!.alpha = 1;
    } else {
      this.allyBuffStatus!.alpha = 0;
    }

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
        GAME_WIDTH / 5,
        GAME_HEIGHT - 60,
        this.player,
        skillList.get(`attack`)!,
        this.enemy!
      )
    );

    /*
    this.player?.addAction(
      new TargetEnemyAction(
        this,
        this.skillDescription!,
        (4 * GAME_WIDTH) / 5,
        GAME_HEIGHT - 60,
        this.player,
        skillList.get(`dual strikes`)!,
        this.enemy!,
        5
      )
    );*/

    this.player?.addAction(
      new TargetAllyAction(
        this,
        this.skillDescription!,
        (GAME_WIDTH * 2) / 5,
        GAME_HEIGHT - 60,
        this.player,
        skillList.get(`heal`)!,
        this.allies
      )
    );

    this.player?.addAction(
      new TargetEnemyAction(
        this,
        this.skillDescription!,
        (GAME_WIDTH * 3) / 5,
        GAME_HEIGHT - 60,
        this.player,
        skillList.get(`draining blow`)!,
        this.enemy!,
        6
      )
    );

    this.player?.addAction(
      new TargetEnemyAction(
        this,
        this.skillDescription!,
        (4 * GAME_WIDTH) / 5,
        GAME_HEIGHT - 60,
        this.player,
        skillList.get(`rampage`)!,
        this.enemy!,
        7
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
    } else {
      this.dimUI!.alpha = 1;
    }
  }

  endGame() {
    this.scene.start("End");
  }

  simulateAllies() {
    for (let i = 1; i < 4; i++) {
      const ally = this.allies[i];
      if (ally.isAlive() && ally.canAct()) {
        const actChance = Math.random();
        if (actChance < 0.05) {
          skillList.get("empower")?.effect(ally, this.player as Character);
          ally.setActRate(skillList.get("empower")!.actRate);
        } else if (actChance < 0.1) {
          skillList.get("armor pierce")?.effect(ally, this.enemy as Character);
          ally.setActRate(skillList.get("armor pierce")!.actRate);
        } else if (actChance < 0.15) {
          skillList
            .get("weakening blow")
            ?.effect(ally, this.enemy as Character);
          ally.setActRate(skillList.get("weakening blow")!.actRate);
        } else if (actChance < 0.2) {
          skillList.get("dual strikes")?.effect(ally, this.enemy as Character);
          ally.setActRate(skillList.get("dual strikes")!.actRate);
        } else {
          skillList.get("attack")?.effect(ally, this.enemy as Character);
          ally.setActRate(skillList.get("attack")!.actRate);
        }

        ally.resetAction();
      }

      ally.actionbar.update();
    }
  }
}
