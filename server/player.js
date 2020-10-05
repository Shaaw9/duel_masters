module.exports = class Player {
    constructor(id, socket) {
        this.id = id;
        this.socket = socket;
        this.deck = [
            (this.DECK = []),
            (this.HAND = []),
            (this.BATTLE_ZONE = []),
            (this.MANA_ZONE = []),
            (this.SHIELD_ZONE = []),
            (this.GRAVEYARD = []),
        ];
    }
};
