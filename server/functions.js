const DECK = 0;
const HAND = 1;
const BATTLE_ZONE = 2;
const MANA_ZONE = 3;
const SHIELD_ZONE = 4;
const GRAVEYARD = 5;

module.exports = function mergeDeck(player) {
    var deck = player.deck[HAND].concat(player.deck[DECK])
        .concat(player.deck[GRAVEYARD])
        .concat(player.deck[MANA_ZONE])
        .concat(player.deck[SHIELD_ZONE])
        .concat(player.deck[BATTLE_ZONE]);
    return deck;
};
