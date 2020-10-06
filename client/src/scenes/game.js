import { GameObjects } from "phaser";
import Card from "../helpers/card";

const DECK = 0;
const HAND = 1;
const BATTLE_ZONE = 2;
const MANA_ZONE = 3;
const SHIELD_ZONE = 4;
const GRAVEYARD = 5;

export default class Game extends Phaser.Scene {
    constructor() {
        super({
            key: "Game",
        });
    }
    preload() {
        this.load.image("bg", "src/assets/bg.png");
        this.load.image("bloody_squito", "src/assets/bloody_squito.png");
        this.load.image("brawler_zyler", "src/assets/brawler_zyler.png");
        this.load.image("cardBack", "src/assets/cardBack.png");
    }
    create() {
        let self = this;
        this.url = "ws://localhost:8010";
        this.socket = new WebSocket(this.url);
        this.socket.onopen = this.socketOnOpen.bind(this);
        this.socket.onmessage = this.socketOnMessage.bind(this);
        this.add.image(0, 0, "bg").setOrigin(0, 0);
        this.playerDeck = [];
        this.opponentDeck = [];
        this.id;
        this.tempDepth;
        this.draggedCard;
        this.input.mouse.disableContextMenu();
        this.scaledImage;
        /*this.rightClickDown = false;
        this.input.on(
            "pointerdown",
            function (pointer) {
                if (pointer.rightButtonDown()) {
                    console.log("jobb");
                }
            },
            this
        );
        this.input.on(
            "pointerup",
            function (pointer) {
                console.log("asd");
                if (pointer.rightButton()) {
                    console.log("jobb");
                }
            },
            this
        );*/
        /* this.MANA_ZONE = this.add.zone(197.5, 920, 395, 320).setRectangleDropZone(395, 320).setInteractive();
        this.graphics = this.add.graphics();
        this.graphics.lineStyle(2, 0xffff00);
        this.graphics.strokeRect(
            this.MANA_ZONE.x - this.MANA_ZONE.input.hitArea.width / 2,
            this.MANA_ZONE.y - this.MANA_ZONE.input.hitArea.height / 2,
            this.MANA_ZONE.input.hitArea.width,
            this.MANA_ZONE.input.hitArea.height
        );

        this.MANA_ZONE.on("pointerdown", function () {
            console.log(this === this.MANA_ZONE);
        });*/
        //let self = this;
        //this.add.image(0, 0, "bg").setOrigin(0, 0); //setting background image
        /*this.zone = new Zone(this);
        
        this.MANA_ZONE = this.zone.renderZone(197.5, 920, 395, 320);
        this.outline = this.zone.renderOutline(this.MANA_ZONE);

        this.BATTLE_ZONE = this.zone.renderZone(960, 650, 1920, 220);
        this.outline = this.zone.renderOutline(this.BATTLE_ZONE);

        this.SHIELD_ZONE = this.zone.renderZone(960, 810, 1130, 100);
        this.outline = this.zone.renderOutline(this.SHIELD_ZONE);

        this.HAND_ZONE = this.zone.renderZone(960, 970, 1130, 220);
        this.outline = this.zone.renderOutline(this.HAND_ZONE);

        this.DECK_ZONE = this.zone.renderZone(1625, 920, 200, 320);
        this.outline = this.zone.renderOutline(this.DECK_ZONE);
        

        this.DEAD_ZONE = this.zone.renderZone(1822.5, 920, 195, 320);
        this.outline = this.zone.renderOutline(this.DEAD_ZONE);*/
        this.input.on("dragstart", function (pointer, GameObject) {
            if (GameObject.getData("location") === "hand" && GameObject.getData("playerCard")) {
                this.tempDepth = GameObject.depth;
                self.children.bringToTop(GameObject);
                GameObject.x = self.input.mousePointer.x;
                GameObject.y = self.input.mousePointer.y;
                self.socket.send(JSON.stringify({ event: "dragStart", x: GameObject.x, y: GameObject.y, uniqueID: GameObject.getData("uniqueID") }));
            }
        });

        this.input.on("dragend", function (pointer, GameObject, dropped) {
            if (GameObject.getData("location") === "hand" && GameObject.getData("playerCard")) {
                self.socket.send(
                    JSON.stringify({
                        event: "dragEnd",
                        tempDepth: this.tempDepth,
                        dropped: dropped,
                        x: GameObject.input.dragStartX,
                        y: GameObject.input.dragStartY,
                    })
                );
                GameObject.setDepth(this.tempDepth);
                if (!dropped) {
                    GameObject.x = GameObject.input.dragStartX;
                    GameObject.y = GameObject.input.dragStartY;
                }
            }
        });
        this.input.on("drag", function (pointer, GameObject, dragX, dragY) {
            if (GameObject.getData("location") === "hand" && GameObject.getData("playerCard")) {
                GameObject.x = self.input.mousePointer.x;
                GameObject.y = self.input.mousePointer.y;
                self.socket.send(JSON.stringify({ event: "drag", x: GameObject.x, y: GameObject.y, uniqueID: GameObject.getData("uniqueID") }));
            }
        });

        this.input.on("gameobjectup", function (pointer, GameObject) {
            if (GameObject.getData("location") === "deck" && GameObject.getData("playerCard")) {
                self.socket.send(JSON.stringify({ event: "drawCard", id: self.id }));
            }
            if (this.scaledImage != null) this.scaledImage.destroy();
        });

        this.input.on("gameobjectout", function (pointer, GameObject) {
            if (this.scaledImage != null) this.scaledImage.destroy();
        });

        this.input.on("gameobjectdown", function (pointer, GameObject) {
            if (pointer.rightButtonDown() && GameObject.getData("location") === "hand" && GameObject.getData("playerCard")) {
                this.scaledImage = self.add
                    .image(GameObject.x, GameObject.y - 100, GameObject.texture.key)
                    .setOrigin(0.5, 1)
                    .setDisplaySize(195, 270)
                    .setDepth(100);
            }
        });

        this.input.on("gameobjectover", function (pointer, GameObject) {
            if (pointer.rightButtonDown() && GameObject.getData("location") === "hand" && GameObject.getData("playerCard")) {
                this.scaledImage = self.add
                    .image(GameObject.x, GameObject.y - 100, GameObject.texture.key)
                    .setOrigin(0.5, 1)
                    .setDisplaySize(195, 270)
                    .setDepth(100);
            }
        });
    }
    syncDeck(data) {
        if (data.hostID === this.id) {
            for (var i = 0; i < data.p1deck.length; i++) {
                for (var j = 0; j < this.playerDeck.length; j++) {
                    if (data.p1deck[i].uniqueID === this.playerDeck[j].getData("uniqueID")) {
                        this.playerDeck[j].setDepth(data.p1deck[i].id);
                        this.playerDeck[j].x = data.p1deck[i].x;
                        this.playerDeck[j].y = data.p1deck[i].y;
                        this.playerDeck[j].setData({ location: data.p1deck[i].location });
                        if (data.p1deck[i].location === "deck") {
                            this.playerDeck[j].setTexture("cardBack").setDisplaySize(130, 180).setInteractive();
                        }
                        if (data.p1deck[i].location === "hand") {
                            this.playerDeck[j].setTexture(data.p1deck[i].name).setDisplaySize(130, 180).setInteractive();
                        }
                    }
                }
            }
            for (var i = 0; i < data.p2deck.length; i++) {
                for (var j = 0; j < this.opponentDeck.length; j++) {
                    if (data.p2deck[i].uniqueID === this.opponentDeck[j].getData("uniqueID")) {
                        this.opponentDeck[j].setDepth(data.p2deck[i].id);
                        this.opponentDeck[j].x = 1920 - data.p2deck[i].x;
                        this.opponentDeck[j].y = 1080 - data.p2deck[i].y;
                        this.opponentDeck[j].setData({ location: data.p2deck[i].location });
                        if (data.p2deck[i].location === "deck" || data.p2deck[i].location === "hand") {
                            this.opponentDeck[j].setTexture("cardBack").setDisplaySize(130, 180).setAngle(180);
                        }
                    }
                }
            }
        } else {
            for (var i = 0; i < data.p1deck.length; i++) {
                for (var j = 0; j < this.opponentDeck.length; j++) {
                    if (data.p1deck[i].uniqueID === this.opponentDeck[j].getData("uniqueID")) {
                        this.opponentDeck[j].setDepth(data.p1deck[i].id);
                        this.opponentDeck[j].x = 1920 - data.p1deck[i].x;
                        this.opponentDeck[j].y = 1080 - data.p1deck[i].y;
                        this.opponentDeck[j].setData({ location: data.p1deck[i].location });
                        if (data.p1deck[i].location === "deck") {
                            this.opponentDeck[j].setTexture("cardBack").setDisplaySize(130, 180).setAngle(180);
                        }
                    }
                }
            }
            for (var i = 0; i < data.p2deck.length; i++) {
                for (var j = 0; j < this.playerDeck.length; j++) {
                    if (data.p2deck[i].uniqueID === this.playerDeck[j].getData("uniqueID")) {
                        this.playerDeck[j].setDepth(data.p2deck[i].id);
                        this.playerDeck[j].x = data.p2deck[i].x;
                        this.playerDeck[j].y = data.p2deck[i].y;
                        this.playerDeck[j].setData({ location: data.p2deck[i].location });
                        if (data.p2deck[i].location === "deck" || data.p2deck[i].location === "hand") {
                            this.playerDeck[j].setTexture("cardBack").setDisplaySize(130, 180);
                        }
                        if (data.p2deck[i].location === "hand") {
                            this.playerDeck[j].setTexture(data.p2deck[i].name).setDisplaySize(130, 180);
                        }
                    }
                }
            }
        }
    }
    socketOnOpen() {
        console.log("Connected");
    }
    socketOnMessage(e) {
        var data = JSON.parse(e.data);
        switch (data.event) {
            case "userinfo":
                this.id = data.id;
                break;
            case "init":
                if (this.id === data.hostID) {
                    for (var i = 0; i < data.p1deck.length; i++) {
                        this.playerDeck.push(new Card(this).render(data.p1deck[i].uniqueID, true));
                    }
                    for (var i = 0; i < data.p2deck.length; i++) {
                        this.opponentDeck.push(new Card(this).render(data.p2deck[i].uniqueID, false));
                    }
                    this.syncDeck(data);
                } else {
                    for (var i = 0; i < data.p1deck.length; i++) {
                        this.opponentDeck.push(new Card(this).render(data.p1deck[i].uniqueID, false));
                    }
                    for (var i = 0; i < data.p2deck.length; i++) {
                        this.playerDeck.push(new Card(this).render(data.p2deck[i].uniqueID, true));
                    }
                    this.syncDeck(data);
                }
                break;
            case "dragStart":
                for (var i = 0; i < this.opponentDeck.length; i++) {
                    if (data.uniqueID === this.opponentDeck[i].getData("uniqueID")) {
                        this.draggedCard = this.opponentDeck[i];
                        this.children.bringToTop(this.draggedCard);
                        this.draggedCard.x = 1920 - data.x;
                        this.draggedCard.y = 1080 - data.y;
                    }
                }
                break;
            case "dragEnd":
                this.draggedCard.setDepth(data.tempDepth);
                if (!data.dropped) {
                    this.draggedCard.x = 1920 - data.x;
                    this.draggedCard.y = 1080 - data.y;
                }
                this.draggedCard = null;
                break;
            case "drag":
                this.draggedCard.x = 1920 - data.x;
                this.draggedCard.y = 1080 - data.y;
                break;
            case "syncDecks":
                this.syncDeck(data);
                break;
        }
    }
}
