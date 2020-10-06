const DECK = 0;
const HAND = 1;
const BATTLE_ZONE = 2;
const MANA_ZONE = 3;
const SHIELD_ZONE = 4;
const GRAVEYARD = 5;

const mergeDeck = require("./functions");

module.exports = class Game {
    constructor(p1, p2, hostID) {
        this.p1 = p1;
        this.p2 = p2;
        this.hostID = hostID;
    }
    init() {
        this.positionDeck();
        this.broadcast({ event: "init", p1deck: mergeDeck(this.p1), p2deck: mergeDeck(this.p2), hostID: this.hostID });
    }

    broadcast(data) {
        this.p1.socket.send(JSON.stringify(data));
        this.p2.socket.send(JSON.stringify(data));
    }
    handOrganizer(hand) {
        var x;
        var gap = 140;
        if (hand.length <= 8) {
            x = 960 - ((hand.length - 1) * 140) / 2;
        } else {
            x = 470;
            gap = 1000 / (hand.length - 1);
        }
        for (var i = 0; i < hand.length; i++) {
            hand[i].x = x + i * gap;
            hand[i].y = 960;
            hand[i].id = i;
        }
        return hand;
    }
    drawCard(id) {
        var player;
        if (this.p1.id === id) {
            player = this.p1;
        } else {
            player = this.p2;
        }
        if (player.deck[DECK].length > 0) {
            var card = player.deck[DECK][player.deck[DECK].length - 1];
            card.location = "hand";
            player.deck[HAND].push(card);
            player.deck[DECK].splice(player.deck[DECK].length - 1, 1);

            var handToSend = this.handOrganizer(player.deck[HAND]);

            if (player === this.p1) {
                this.broadcast({ event: "drawCard", p1deck: handToSend, p2deck: [], hostID: this.hostID });
            } else {
                this.broadcast({ event: "drawCard", p1deck: [], p2deck: handToSend, hostID: this.hostID });
            }
        }
    }
    positionDeck() {
        for (var i = 0; i < this.p1.deck[DECK].length; i++) {
            this.p1.deck[DECK][i].x = 1610 + i * 0.2;
            this.p1.deck[DECK][i].y = 870 - i * 0.3;
        }
        for (var i = 0; i < this.p2.deck[DECK].length; i++) {
            this.p2.deck[DECK][i].x = 1610 + i * 0.2;
            this.p2.deck[DECK][i].y = 870 - i * 0.3;
        }
    }

    syncDecks() {
        this.broadcast({ event: "syncDecks", p1deck: mergeDeck(this.p1), p2deck: mergeDeck(this.p2), hostID: this.hostID });
    }
};
