import "./style.css";
import Phaser from "phaser";
import { Start } from "./scenes/startScene";
import { Combat } from "./scenes/combatScene";
import { End } from "./scenes/endScene";

let config = {
  parent: 'app',
  autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
  type: Phaser.CANVAS,
  width: 1280,
  height: 720,
  scene: [Start, Combat, End],
};

let game = new Phaser.Game(config);
