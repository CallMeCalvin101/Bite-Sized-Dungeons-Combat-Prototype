import "./style.css";
import Phaser from "phaser";
import WebFont from "webfontloader";
import { Start } from "./scenes/startScene";
import { Team } from "./scenes/team";
import { Menu } from "./scenes/menu";
import { Settings } from "./scenes/settings";
import { Credits } from "./scenes/credits";
import { Combat2 } from "./scenes/combatScene2";
import { End } from "./scenes/endScene";

let config = {
  parent: "app",
  autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
  type: Phaser.CANVAS,
  width: 1280,
  height: 720,
  scene: [Team, Menu, Credits, Settings, Start, Combat2, End],
  playerClass: "default",
};

WebFont.load({
  google: {
    families: ["Bangers", "MedievalSharp", "Silkscreen"],
  },
  active: function () {
    new Phaser.Game(config);
  },
});
