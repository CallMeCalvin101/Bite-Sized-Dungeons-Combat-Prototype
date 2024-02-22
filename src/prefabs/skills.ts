import { Player, Character } from "./characterElements";

export enum SkillType {
  TargetEnemy,
  TargetAlly,
}

export interface Skill {
  name: string;
  type: SkillType;
  description: string;
  actRate: number;
  effect(source: Player, target: Character): void;
}

export const skillList: Map<string, Skill> = new Map();

function modDamage(player: Player, n: number): number {
  if (player.hasBuff("Attack")) {
    return n * 1.5 + 10;
  } else {
    return n;
  }
}

class basicAttack implements Skill {
  public name = "attack";
  public type = SkillType.TargetEnemy;
  public description = "Small damage to the enemy";
  public actRate = 1.5;

  effect(source: Player, target: Character) {
    target.damage(modDamage(source, 5));
  }
}

skillList.set("attack", new basicAttack());

class healingSkill implements Skill {
  public name = "heal";
  public type = SkillType.TargetAlly;
  public description = "Heals the selected ally for 50 health";
  public actRate = 0.5;

  effect(source: Player, target: Character) {
    target.heal(modDamage(source, 50));
  }
}

skillList.set("heal", new healingSkill());

class dualStrikes implements Skill {
  public name = "dual strikes";
  public type = SkillType.TargetEnemy;
  public description = "Deals 2 heavy blows to the enemy";
  public actRate = 0.75;

  effect(source: Player, target: Character) {
    target.damage(modDamage(source, 15));
    setTimeout(() => {
      target.damage(modDamage(source, 30));
    }, 200);
  }
}

skillList.set("dual strikes", new dualStrikes());

class rampage implements Skill {
  public name = "rampage";
  public type = SkillType.TargetEnemy;
  public description = "Deals 5 heavy blows to the enemy";
  public actRate = 0.5;

  effect(source: Player, target: Character) {
    const dps = modDamage(source, 10);
    target.damage(dps);
    setTimeout(() => {
      target.damage(dps);
    }, 100);
    setTimeout(() => {
      target.damage(dps);
    }, 200);
    setTimeout(() => {
      target.damage(dps);
    }, 300);
    setTimeout(() => {
      target.damage(dps);
    }, 400);
  }
}

skillList.set("rampage", new rampage());
