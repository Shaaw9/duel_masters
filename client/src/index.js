import Phaser from "phaser";
import Game from "./scenes/game";

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: "phaser-example",
        width: 1920,
        height: 1080,
    },
    scene: [Game],
};

const game = new Phaser.Game(config);
