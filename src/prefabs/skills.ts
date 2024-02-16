import { HealthBar, Skill, SkillType } from "./characterElements";

export const skillList: Map<string, Skill> = new Map();

class healingSkill implements Skill {
  public name = "heal";
  public type = SkillType.TargetAlly;
  public description = "Heals the selected ally for 50 health";

  effect(target: HealthBar) {
    target.increaseBar(50);
  }
}

skillList.set("heal", new healingSkill());

class dualStrikes implements Skill {
  public name = "dual strikes";
  public type = SkillType.TargetEnemy;
  public description = "Deals 2 heavy blows to the enemy";

  effect(target: HealthBar) {
    target.decreaseBar(15);
    setTimeout(() => {
      target.decreaseBar(30);
    }, 200);
  }
}

skillList.set("dual strikes", new dualStrikes());
