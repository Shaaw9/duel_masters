import { GameObjects } from "phaser";

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

        this.dealText = this.add.text(75, 350, ["DEAL CARDS"]).setFontSize(30).setInteractive();
        this.dealText.on("pointerdown", function () {
            self.socket.send(JSON.stringify({ event: "drawCard", id: self.id }));
        });

        this.MANA_ZONE = this.add.zone(197.5, 920, 395, 320).setRectangleDropZone(395, 320).setInteractive();
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
        });
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
            this.tempDepth = GameObject.depth;
            self.socket.send(JSON.stringify({ event: "dragStart", uniqueID: GameObject.getData("uniqueID") }));
        });

        this.input.on("dragend", function (pointer, GameObject, dropped) {
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
        });
        this.input.on("drag", function (pointer, GameObject, dragX, dragY) {
            self.children.bringToTop(GameObject);
            GameObject.x = dragX;
            GameObject.y = dragY;
            self.socket.send(JSON.stringify({ event: "drag", x: GameObject.x, y: GameObject.y, uniqueID: GameObject.getData("uniqueID") }));
        });

        /*this.input.on("pointerdown", function(pointer,GameObject)){
            if(GameObject.getData())
        }*/
        /*this.input.on("drop", function (pointer, GameObject, dropped) {
            if(!dropped){
                GameObject.x =
            }  
        });*/
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
                    for (var i = 0; i < data.p1deck[DECK].length; i++) {
                        var card = this.add
                            .image(data.p1deck[DECK][i].x, data.p1deck[DECK][i].y, data.p1deck[DECK][i].name)
                            .setInteractive()
                            .setDisplaySize(130, 180)
                            .setSize(130, 180);
                        this.input.setDraggable(card);
                        /*if (data.p1deck[DECK][i].location === "deck") {
                            card.setTexture("cardBack").setDisplaySize(130, 180).setSize(130, 180);
                        }*/
                        card.setData({ id: data.p1deck[DECK][i].id, uniqueID: data.p1deck[DECK][i].uniqueID });
                        card.setDepth(data.p1deck[DECK][i].id);
                        this.playerDeck.push(card);
                    }
                    for (var i = 0; i < data.p2deck[DECK].length; i++) {
                        var card = this.add
                            .image(1920 - data.p2deck[DECK][i].x, 1080 - data.p2deck[DECK][i].y, data.p2deck[DECK][i].name)
                            .setInteractive()
                            .setDisplaySize(130, 180)
                            .setSize(130, 180);
                        //this.input.setDraggable(card);
                        card.setData({ id: data.p2deck[DECK][i].id, uniqueID: data.p2deck[DECK][i].uniqueID });
                        /* if (data.p2deck[DECK][i].location === "deck") {
                            card.setTexture("cardBack").setDisplaySize(130, 180).setSize(130, 180);
                        }*/
                        card.setDepth(data.p2deck[DECK][i].id);
                        card.setAngle(180);
                        this.opponentDeck.push(card);
                    }
                } else {
                    for (var i = 0; i < data.p1deck[DECK].length; i++) {
                        var card = this.add
                            .image(1920 - data.p1deck[DECK][i].x, 1080 - data.p1deck[DECK][i].y, data.p1deck[DECK][i].name)
                            .setInteractive()
                            .setDisplaySize(130, 180)
                            .setSize(130, 180);
                        //this.input.setDraggable(card);
                        card.setData({ id: data.p1deck[DECK][i].id, uniqueID: data.p1deck[DECK][i].uniqueID });
                        /* if (data.p1deck[DECK][i].location === "deck") {
                            card.setTexture("cardBack").setDisplaySize(130, 180).setSize(130, 180);
                        }*/
                        card.setDepth(data.p1deck[DECK][i].id);
                        card.setAngle(180);
                        this.opponentDeck.push(card);
                    }
                    for (var i = 0; i < data.p2deck[DECK].length; i++) {
                        var card = this.add
                            .image(data.p2deck[DECK][i].x, data.p1deck[DECK][i].y, data.p2deck[DECK][i].name)
                            .setInteractive()
                            .setDisplaySize(130, 180)
                            .setSize(130, 180);
                        this.input.setDraggable(card);
                        card.setData({ id: data.p2deck[DECK][i].id, uniqueID: data.p1deck[DECK][i].uniqueID });
                        /*if (data.p2deck[DECK][i].location === "deck") {
                            card.setTexture("cardBack").setDisplaySize(130, 180).setSize(130, 180);
                        }*/
                        card.setDepth(data.p2deck[DECK][i].id);
                        this.playerDeck.push(card);
                    }
                }
                break;
            case "dragStart":
                for (var i = 0; i < this.opponentDeck.length; i++) {
                    if (data.uniqueID === this.opponentDeck[i].getData("uniqueID")) {
                        this.draggedCard = this.opponentDeck[i];
                        this.children.bringToTop(this.draggedCard);
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
            case "drawCard":
                copyDeck(this.id, data.hostID, data.p1deck, data.p2deck, this.playerDeck, this.opponentDeck);
        }
    }
}

function copyDeck(localID, hostID, p1deck, p2deck, playerDeck, opponentDeck) {
    if (localID === hostID) {
        for (var i = 0; i < p1deck.length; i++) {
            for (var j = 0; j < playerDeck.length; j++) {
                if (p1deck[i].uniqueID === playerDeck[j].getData("uniqueID")) {
                    playerDeck[j].setDepth(p1deck[i].id);
                    playerDeck[j].x = p1deck[i].x;
                    playerDeck[j].y = p1deck[i].y;
                }
            }
        }
        for (var i = 0; i < p2deck.length; i++) {
            for (var j = 0; j < opponentDeck.length; j++) {
                if (p2deck[i].uniqueID === opponentDeck[j].getData("uniqueID")) {
                    opponentDeck[j].setDepth(p2deck[i].id);
                    opponentDeck[j].x = 1920 - p2deck[i].x;
                    opponentDeck[j].y = 1080 - p2deck[i].y;
                }
            }
        }
    } else {
        for (var i = 0; i < p1deck.length; i++) {
            for (var j = 0; j < opponentDeck.length; j++) {
                if (p1deck[i].uniqueID === opponentDeck[j].getData("uniqueID")) {
                    opponentDeck[j].setDepth(p1deck[i].id);
                    opponentDeck[j].x = 1920 - p1deck[i].x;
                    opponentDeck[j].y = 1080 - p1deck[i].y;
                }
            }
        }
        for (var i = 0; i < p2deck.length; i++) {
            for (var j = 0; j < playerDeck.length; j++) {
                if (p2deck[i].uniqueID === playerDeck[j].getData("uniqueID")) {
                    playerDeck[j].setDepth(p2deck[i].id);
                    playerDeck[j].x = p2deck[i].x;
                    playerDeck[j].y = p2deck[i].y;
                }
            }
        }
    }
}
