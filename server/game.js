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
        this.turn = {
            id: this.p1.id,
            drawsLeft: 1,
            canSummon: true,
            manaLeft: 1,
        };
    }
    init() {
        this.positionDeck();
        this.broadcast({ event: "init", p1deck: mergeDeck(this.p1.deck), p2deck: mergeDeck(this.p2.deck), hostID: this.hostID, turn: this.turn });
    }

    getPlayerByID(id) {
        var player;
        if (id === this.p1.id) {
            player = this.p1;
        } else {
            player = this.p2;
        }
        return player;
    }

    getCardByID(player, id) {
        for (var i = 0; i < player.deck.length; i++) {
            for (var j = 0; j < player.deck[i].length; j++) {
                if (player.deck[i][j].uniqueID === id) {
                    return player.deck[i][j];
                }
            }
        }
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
            gap = 980 / (hand.length - 1);
        }
        for (var i = 0; i < hand.length; i++) {
            hand[i].x = x + i * gap;
            hand[i].y = 970;
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
                this.syncDecks(handToSend, []);
                //this.broadcast({ event: "drawCard", p1deck: handToSend, p2deck: [], hostID: this.hostID });
            } else {
                this.syncDecks([], handToSend);
                //this.broadcast({ event: "drawCard", p1deck: [], p2deck: handToSend, hostID: this.hostID });
            }
        }
    }

    dropCard(id, uniqueID, zone) {
        var player = this.getPlayerByID(id);
        var card = this.getCardByID(player, uniqueID);
        switch (zone) {
            case "MANA_ZONE":
                if (player.deck[MANA_ZONE].length < 14 && this.turn.manaLeft > 0) {
                    player.deck[HAND].splice(player.deck[HAND].indexOf(card), 1);

                    card.id = player.deck[MANA_ZONE].length;
                    card.location = "mana";
                    player.deck[MANA_ZONE].push(card);
                    if (player.deck[MANA_ZONE].length > 7) {
                        card.x = 275;
                        card.y = 700 + player.deck[MANA_ZONE].length * 20;
                    } else {
                        card.x = 115;
                        card.y = 840 + player.deck[MANA_ZONE].length * 20;
                    }
                    this.handOrganizer(player.deck[HAND]);
                }
        }
        this.syncDecks(mergeDeck(this.p1.deck), mergeDeck(this.p2.deck));
    }

    positionDeck() {
        for (var i = 0; i < this.p1.deck[DECK].length; i++) {
            this.p1.deck[DECK][i].x = 1620 + i * 0.2;
            this.p1.deck[DECK][i].y = 920 - i * 0.3;
        }
        for (var i = 0; i < this.p2.deck[DECK].length; i++) {
            this.p2.deck[DECK][i].x = 1620 + i * 0.2;
            this.p2.deck[DECK][i].y = 920 - i * 0.3;
        }
    }

    syncDecks(p1deck, p2deck) {
        this.broadcast({ event: "syncDecks", p1deck: p1deck, p2deck: p2deck, hostID: this.hostID, turn: this.turn });
    }
};
