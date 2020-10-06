export default class Card {
    constructor(scene) {
        this.render = (uniqueID) => {
            let card = scene.add.image(0, 0, "cardBack").setDisplaySize(130, 180).setSize(130, 180).setData({
                uniqueID: uniqueID,
            });
            card.setInteractive();
            scene.input.setDraggable(card);
            return card;
        };
    }
}
