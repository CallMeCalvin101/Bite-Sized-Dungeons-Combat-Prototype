import "./style.css";
import Phaser from "phaser";
import { Start } from "./scenes/startScene";
//import { Combat } from "./scenes/combatScene";
import { Combat2 } from "./scenes/combatScene2";
import { End } from "./scenes/endScene";

let config = {
  parent: "app",
  autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
  type: Phaser.CANVAS,
  width: 1280,
  height: 720,
  scene: [Start, Combat2, End],
};

new Phaser.Game(config);
