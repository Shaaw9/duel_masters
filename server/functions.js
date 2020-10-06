const DECK = 0;
const HAND = 1;
const BATTLE_ZONE = 2;
const MANA_ZONE = 3;
const SHIELD_ZONE = 4;
const GRAVEYARD = 5;

module.exports = function mergeDeck(deck) {
    var copied = deck[HAND].concat(deck[DECK]).concat(deck[GRAVEYARD]).concat(deck[MANA_ZONE]).concat(deck[SHIELD_ZONE]).concat(deck[BATTLE_ZONE]);
    return copied;
};
