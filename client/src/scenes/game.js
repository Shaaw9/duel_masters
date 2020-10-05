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
                        if (data.p1deck[DECK][i].location === "deck") {
                            card.setTexture("cardBack").setDisplaySize(130, 180).setSize(130, 180);
                        }
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
                        if (data.p2deck[DECK][i].location === "deck") {
                            card.setTexture("cardBack").setDisplaySize(130, 180).setSize(130, 180);
                        }
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
                        if (data.p1deck[DECK][i].location === "deck") {
                            card.setTexture("cardBack").setDisplaySize(130, 180).setSize(130, 180);
                        }
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
                        if (data.p2deck[DECK][i].location === "deck") {
                            card.setTexture("cardBack").setDisplaySize(130, 180).setSize(130, 180);
                        }
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
                if (this.id === data.hostID) {
                    for (var i = 0; i < data.deck.length; i++) {
                        for (var j = 0; j < this.playerDeck.length; j++) {
                            if (data.deck[i].uniqueID === this.playerDeck[j].getData("uniqueID")) {
                                if (data.deck[i].location === "hand") {
                                    this.playerDeck[j].setTexture(data.deck[i].name).setDisplaySize(130, 180).setSize(130, 180);
                                    this.playerDeck[j].x = data.deck[i].x;
                                    this.playerDeck[j].y = data.deck[i].y;
                                }
                            }
                        }
                    }
                } else {
                    for (var i = 0; i < data.deck.length; i++) {
                        for (var j = 0; j < this.opponentDeck.length; j++) {
                            if (data.deck[i].uniqueID === this.opponentDeck[j].getData("uniqueID")) {
                                this.opponentDeck[j].x = 1920 - data.deck[i].x;
                                this.opponentDeck[j].y = 1080 - data.deck[i].y;
                            }
                        }
                    }
                }
            /*for(var i = 0;i<this.opponentDeck.length;i++){
                        if(data.uniqueID === )
                    }*/
        }
    }
}
