import "./style.css";
import Phaser from "phaser";
import { Start } from "./scenes/startScene";
import { Combat } from "./scenes/combatScene";

let config = {
  parent: 'app',
  autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
  type: Phaser.CANVAS,
  width: 1080,
  height: 780,
  scene: [Start, Combat],
};

let game = new Phaser.Game(config);
