const { runInThisContext } = require("vm");

module.exports = class Card {
    constructor(uniqueID, id, name) {
        this.id = id;
        this.name = name;
        this.uniqueID = uniqueID;
        this.x = 0;
        this.y = 0;
        this.location = "deck";
    }
};
