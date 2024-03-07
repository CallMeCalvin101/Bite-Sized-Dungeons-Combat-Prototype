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
  allyActionStatus: Phaser.GameObjects.Text[];

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
    this.allyActionStatus = [];
  }

  preload() {}

  create() {
    this.drawBackground();
    this.initializeUI();
    this.initializePlayer();
    this.initializeAllies();
    this.enemy = new Enemy(this, 2000);

    const status = this.add.text(GAME_WIDTH / 2 + 20, 92, "Status:");
    status.setFontSize("28px");
    status.setColor("black");
    status.setFontStyle("bold");

    this.enemyDefenseStatus = this.add.text(
      GAME_WIDTH / 2 + 144 + 96,
      92,
      `🛡️⬇️`
    );
    this.enemyDefenseStatus.setFontSize("28px");
    this.enemyDefenseStatus.setColor("black");

    this.enemyAttackStatus = this.add.text(GAME_WIDTH / 2 + 144, 92, `⚔️⬇️`);
    this.enemyAttackStatus.setFontSize("28px");
    this.enemyAttackStatus.setColor("black");

    this.allyBuffStatus = this.add.text(
      GAME_WIDTH / 2 - 48,
      GAME_HEIGHT - 100 - 58,
      `⚔️⬆️`
    );
    this.allyBuffStatus.setFontSize("28px");
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

    if (!this.player?.canAct()) {
      this.skillDescription?.setText("Waiting...");
    } else if (
      this.player?.canAct() &&
      this.skillDescription?.text == "Waiting..."
    ) {
      this.skillDescription?.setText("Ready to Act");
    }

    if (!this.player?.isAlive() || this.enemy!.health() <= 0) {
      this.endGame();
    }
  }

  initializePlayer() {
    this.player = new Player(
      this,
      GAME_WIDTH / 2,
      GAME_HEIGHT - 30 - 100,
      GAME_WIDTH,
      30,
      100,
      30,
      100
    );
    this.allies.push(this.player);
    this.player.setActRate(1);

    this.playerHealthText = this.add.text(
      40,
      GAME_HEIGHT - 58 - 100,
      `Your (Player 1) Health: ${this.player.health()}/${
        this.player.healthbar.maxValue
      }   Status:`
    );
    this.playerHealthText.setFontSize("28px");
    this.playerHealthText.setFontStyle("bold");
    this.playerHealthText.setColor("black");

    this.skillDescription = this.add.text(40, GAME_HEIGHT - 100 - 26, ``);
    this.skillDescription.setFontSize("28px");
    this.skillDescription.setFontStyle("bold");
    this.skillDescription.setColor("black");
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

      const action = this.add.text(
        (GAME_WIDTH * i) / 4 - 20,
        GAME_HEIGHT / 2 - 10,
        `👊`
      );
      action.setFontSize(28);
      action.setColor("black");
      action.setFontStyle("bold");
      action.alpha = 0;
      this.allyActionStatus.push(action);
    }

    console.log(this.allies.length);
  }

  initializeActions() {
    const playBasicAttack = new TargetEnemyAction(
      this,
      this.skillDescription!,
      GAME_WIDTH / 5,
      GAME_HEIGHT - 60,
      this.player!,
      skillList.get(`attack`)!,
      this.enemy!
    );

    playBasicAttack.on("pointerdown", () => {
      if (playBasicAttack.isUsable()) {
        this.simulateHit();
      }
    });

    this.player?.addAction(playBasicAttack);

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
        this.allies,
        2
      )
    );

    const playDrainBlow = new TargetEnemyAction(
      this,
      this.skillDescription!,
      (GAME_WIDTH * 3) / 5,
      GAME_HEIGHT - 60,
      this.player!,
      skillList.get(`draining blow`)!,
      this.enemy!,
      4
    );

    playDrainBlow.on("pointerdown", () => {
      if (playDrainBlow.isUsable()) {
        this.simulateHit();
      }
    });

    this.player?.addAction(playDrainBlow);

    const playRampage = new TargetEnemyAction(
      this,
      this.skillDescription!,
      (4 * GAME_WIDTH) / 5,
      GAME_HEIGHT - 60,
      this.player!,
      skillList.get(`rampage`)!,
      this.enemy!,
      7
    );

    playRampage.on("pointerdown", () => {
      if (playRampage.isUsable()) {
        this.simulateHit();
        setTimeout(() => {
          this.simulateHit();
        }, 100);
        setTimeout(() => {
          this.simulateHit();
        }, 200);
        setTimeout(() => {
          this.simulateHit();
        }, 300);
        setTimeout(() => {
          this.simulateHit();
        }, 400);
      }
    });

    this.player?.addAction(playRampage);

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
      `Your Health: ${this.player!.health()}/${
        this.player!.healthbar.maxValue
      }   Status:`
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
      const action = this.allyActionStatus[i - 1];
      if (ally.isAlive() && ally.canAct()) {
        const actChance = Math.random();
        if (actChance < 0.05) {
          skillList.get("empower")?.effect(ally, this.player as Character);
          ally.setActRate(skillList.get("empower")!.actRate);
          action.setText("⚔️⬆️");
        } else if (actChance < 0.1) {
          skillList.get("armor pierce")?.effect(ally, this.enemy as Character);
          ally.setActRate(skillList.get("armor pierce")!.actRate);
          action.setText("🛡️⬇️");
        } else if (actChance < 0.15) {
          skillList
            .get("weakening blow")
            ?.effect(ally, this.enemy as Character);
          ally.setActRate(skillList.get("weakening blow")!.actRate);
          action.setText("⚔️⬇️");
        } else if (actChance < 0.2) {
          skillList.get("dual strikes")?.effect(ally, this.enemy as Character);
          ally.setActRate(skillList.get("dual strikes")!.actRate);
          action.setText("🤺");
        } else {
          skillList.get("attack")?.effect(ally, this.enemy as Character);
          ally.setActRate(skillList.get("attack")!.actRate);
          action.setText("👊");
        }

        ally.resetAction();

        action.alpha = 1;
        setTimeout(() => {
          action.alpha = 0;
        }, 500);
      }

      ally.actionbar.update();
    }
  }

  simulateHit() {
    const randX = 200 * Math.random();
    const randY = 200 * Math.random();
    const hitMarker = this.add.text(
      randX + GAME_WIDTH / 2 - 100,
      randY + 224 - 100,
      "👊"
    );
    hitMarker.setFontSize("60px");

    setTimeout(() => {
      hitMarker.destroy();
    }, 200);
  }
}
