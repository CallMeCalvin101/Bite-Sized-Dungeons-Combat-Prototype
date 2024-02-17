import { HealthBar } from "./characterElements";

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

export const skillList: Map<string, Skill> = new Map();

class basicAttack implements Skill {
  public name = "attack";
  public type = SkillType.TargetEnemy;
  public description = "Small damage to the enemy";
  public actRate = 1.5;

  effect(target: HealthBar) {
    target.decreaseBar(5);
  }
}

skillList.set("attack", new basicAttack());

class healingSkill implements Skill {
  public name = "heal";
  public type = SkillType.TargetAlly;
  public description = "Heals the selected ally for 50 health";
  public actRate = 0.5;

  effect(target: HealthBar) {
    target.increaseBar(50);
  }
}

skillList.set("heal", new healingSkill());

class dualStrikes implements Skill {
  public name = "dual strikes";
  public type = SkillType.TargetEnemy;
  public description = "Deals 2 heavy blows to the enemy";
  public actRate = 0.75;

  effect(target: HealthBar) {
    target.decreaseBar(15);
    setTimeout(() => {
      target.decreaseBar(30);
    }, 200);
  }
}

skillList.set("dual strikes", new dualStrikes());
