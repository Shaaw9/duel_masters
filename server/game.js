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
        this.broadcast({ event: "init", p1deck: this.p1.deck, p2deck: this.p2.deck, hostID: this.hostID });
    }

    broadcast(data) {
        this.p1.socket.send(JSON.stringify(data));
        this.p2.socket.send(JSON.stringify(data));
    }
    handOrganizer(hand) {
        var x;
        if (hand.length <= 8) {
            x = (1920 - (130 * hand.length + 10 * (hand.length - 1))) / 2;
        }
        for (var i = 0; i < hand.length; i++) {
            hand[i].x = x + i * (10 + 130);
            hand[i].y = 870;
            /*if (hand === opp[HAND]) {
                        hand[i].position.y = canvas.height - hand[i].position.y - hand[i].height;
                        hand[i].position.x = canvas.width - hand[i].position.x - hand[i].width;
                    }*/
        }
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

            this.handOrganizer(player.deck[HAND]);
            //this.handOrganizer(this.p2.deck[HAND]);
            var deck = mergeDeck(player);
            this.broadcast({ event: "drawCard", deck: deck, hostID: player.id });
        }
    }
    positionDeck() {
        for (var i = 0; i < this.p1.deck[DECK].length; i++) {
            this.p1.deck[DECK][i].x = 1545 + i * 0.2;
            this.p1.deck[DECK][i].y = 820 - i * 0.3;
        }
        for (var i = 0; i < this.p2.deck[DECK].length; i++) {
            this.p2.deck[DECK][i].x = 1545 + i * 0.2;
            this.p2.deck[DECK][i].y = 820 - i * 0.3;
        }
        //this.shuffle(this.cards[DECK]);
        //this.generateStarterCards();
        //this.sock.emit("syncDeck", this.cards);
    }
};
