'use strict';

var loadAllSprites = require("./spriteHandlers/all.js");

var _ = require("lodash");
var io = require("socket.io-client");
var Actions = require("../../shared/Actions.js");
var GameObject = require("./GameObject.js");
var Pickup = require("./Pickup.js");
var WorldObject = require("./WorldObject.js");
var keyHandler = require("./keyHandler.js");
var worldSprites = require("./spriteHandlers/overWorld.js");

var css = require("../styles/main.css");


var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");


loadAllSprites.then(function() {
    console.log("Sprites loaded");
    lastTick = new Date().getTime();
    tick();
});

var gameObjects = [];
var room = [];
var pickups = [];
var lastTick;

function tick() {
    var now = new Date();
    var dt = now - lastTick;
    lastTick = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(worldSprites.image,
                    worldSprites.roomSprite[0],
                    worldSprites.roomSprite[1],
                    worldSprites.roomSprite[2],
                    worldSprites.roomSprite[3],
                    8,
                    8,
                    worldSprites.roomSprite[2],
                    worldSprites.roomSprite[3]
                    );

    for (var i = 0; i < room.length; i++) {
        for (var j = 0; j < room[i].length; j++) {
            if (room[i][j]) {
                room[i][j].draw(ctx);
            }
        }
    }

    for (var i = 0; i < pickups.length; i++) {
        pickups[i].draw(ctx);
    }


    for (var i = 0; i < gameObjects.length; i++) {
        gameObjects[i].update(dt);
        gameObjects[i].draw(ctx);
    }

    requestAnimationFrame(tick);

}

var name = localStorage.getItem("name") || window.prompt("Name: ");
localStorage.setItem("name", name);

var server = window.location.href.indexOf("localhost") > -1 ? "http://localhost:5000" : 'http://zelda.kriek.io';
var socket = io(server);
keyHandler.socket = socket;

socket.emit(Actions.JOIN, {
    name: name
});

socket.on(Actions.INITIAL_STATE, function(data) {
    window.playerID = socket.id;
    gameObjects = [];
    room = [];
    for (var i = 0; i < data.players.length; i++) {
        var newGameObject = new GameObject({
    		position: data.players[i].position,
    		type: data.players[i].type,
    		direction: data.players[i].direction,
    		id: data.players[i].id
    	});
        gameObjects.push(newGameObject);
        if (newGameObject.id === socket.id) {
            window.myCharacter = newGameObject;
        }
    }
    for (var i = 0; i < data.objects.length; i++) {
        room.push([]);
        for (var j = 0; j < data.objects[i].length; j++) {
            if (data.objects[i][j]) {
                room[i].push(new WorldObject(data.objects[i][j]));
            } else {
                room[i].push(false);
            }
        }
    }
    pickups = [];
    for (var i = 0; i < data.pickups.length; i++) {
        pickups.push(new Pickup(data.pickups[i]));
    }
});

socket.on(Actions.OBJECT_UPDATE, function(data) {
    var object = _.find(gameObjects, function(object) {
        return object.id === data.id;
    });
    object.position = data.position;
    object.isMoving = data.isMoving;
    object.name = data.name;
    object.health = data.health;
    object.isInvincible = data.isInvincible;
    object.state = data.state;
    object.setAttacking(data.isAttacking);
    object.setDirection(data.direction);

});

socket.on(Actions.ADD_OBJECT, function(data) {
    console.log(data);
    gameObjects.push(new GameObject({
        type: data.type,
        position: data.position,
        direction: data.direction,
        id: data.id
    }));
});

socket.on(Actions.ADD_PICKUP, function(data) {
    pickups.push(new Pickup(data));
});

socket.on(Actions.REMOVE_PICKUP, function(data) {
    pickups = [];
});

socket.on(Actions.REMOVE_OBJECT, function(id) {

    gameObjects = _.filter(gameObjects, function(object) {
        return object.id !== id;
    });
    if (document.getElementById(id)) {
        document.getElementById("container").removeChild(document.getElementById(id));
    }
});

socket.on(Actions.HEARTBEAT, function() {
    var ms = new Date().getTime() - lastHeartBeat;
    document.getElementById("ms").innerHTML = "Latency: " + ms + "ms";
});

var lastHeartBeat = 0;

setInterval(function() {
    lastHeartBeat = new Date().getTime();
    socket.emit(Actions.HEARTBEAT);
}, 1000);