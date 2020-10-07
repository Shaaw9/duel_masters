const WebSocket = require("ws");
const fs = require("fs");
const uuid = require("uuid");
const Player = require("./player");
const Card = require("./card");
const Game = require("./game");
const mergeDeck = require("./functions");

//const Card = require("./card");
//const Player = require("./player");
//const Lobby = require("./lobby");

const wss = new WebSocket.Server({ port: 8010 });

var players = [];

const DECK = 0;
const HAND = 1;
const BATTLE_ZONE = 2;
const MANA_ZONE = 3;
const SHIELD_ZONE = 4;
const GRAVEYARD = 5;

var game;

wss.on("open", function open() {
    ws.send("something");
});

wss.on("message", function incoming(data) {
    console.log(data);
});

wss.on("connection", function connection(socket) {
    socket.id = uuid.v4();
    console.log("Socket " + socket.id + " connected");
    socket.onclose = socketOnClose.bind(this, socket);
    //socket.onmessage = messageReceived.bind(this, socket);
    players.push(new Player(socket.id, socket));
    //if (players.length === 2) {
    /*  for (var i = 0; i < 10; i++) {
        users[0].deck[DECK].push(new Card(i, "bloody_squito"));
    }*/
    socket.send(JSON.stringify({ event: "userinfo", id: socket.id }));
    //socket.send(JSON.stringify({ event: "init", deck: players[0].deck }));
    //}
    //socket.onclose = socketOnClose.bind(this, socket);
    socket.on("message", function d(data) {
        messageReceived(socket, data);
    });
    //var p = new Player(socket);
    //p.deck.push(new Card(socket.id, "sanyika"));
    //players.push(p);
    //
    /* if (players.length === 2) {
        var lobby = new Lobby(players[0], players[1]);
        lobby.init();
    }*/
    if (players.length === 2) {
        for (var i = 0; i < 50; i++) {
            players[0].deck[DECK].push(new Card(i, i, "bloody_squito"));
            players[1].deck[DECK].push(new Card(i, i, "brawler_zyler"));
        }
        game = new Game(players[0], players[1], players[0].id);
        game.init();
    }
});

function socketOnClose(socket) {
    console.log("Socket " + socket.id + " disconnected");
    for (var i = 0; i < players.length; i++) {
        if (players[i].id === socket.id) {
            players.splice(i, 1);
        }
    }
}

function messageReceived(socket, d) {
    data = null;
    try {
        data = JSON.parse(d);
    } catch (e) {
        console.log("Data parsing failed!");
        return;
    }
    if (data.event === "drag") {
        if (socket === players[0].socket) {
            players[1].socket.send(JSON.stringify({ event: "drag", x: data.x, y: data.y, uniqueID: data.uniqueID }));
        } else {
            players[0].socket.send(JSON.stringify({ event: "drag", x: data.x, y: data.y, uniqueID: data.uniqueID }));
        }
    }
    if (data.event === "dragStart") {
        if (socket === players[0].socket) {
            players[1].socket.send(JSON.stringify({ event: "dragStart", x: data.x, y: data.y, uniqueID: data.uniqueID }));
        } else {
            players[0].socket.send(JSON.stringify({ event: "dragStart", x: data.x, y: data.y, uniqueID: data.uniqueID }));
        }
    }

    if (data.event === "dragEnd") {
        game.syncDecks(mergeDeck(game.p1.deck), mergeDeck(game.p2.deck));
    }

    if (data.event === "drawCard") {
        game.drawCard(socket.id);
    }

    if (data.event === "drop") {
        console.log(data);
        game.dropCard(socket.id, data.uniqueID, data.zone);
    }
    /*if (data.event === "userinfo") {
        var p = getUserByID(socket.id);
        if (p !== null) {
            p.username = data.username;
            p.userColor = data.userColor;
        }
    }*/
}
