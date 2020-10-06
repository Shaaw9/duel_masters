export default class Card {
    constructor(scene) {
        this.render = (uniqueID, playerCard) => {
            let card = scene.add.image(0, 0, "cardBack").setDisplaySize(130, 180).setData({
                uniqueID: uniqueID,
                playerCard: playerCard,
            });
            card.setInteractive();
            if (playerCard) {
                scene.input.setDraggable(card);
            }
            return card;
        };
    }
}
