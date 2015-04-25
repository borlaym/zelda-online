'use strict';

var linkSprites = require("./spriteHandlers/link.js");
var _ = require("lodash");
var io = require("socket.io-client");
var Actions = require("../../shared/Actions.js");
var GameObject = require("./GameObject.js");
var keyHandler = require("./keyHandler.js");


var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
linkSprites.load().then(function() {
    lastTick = new Date().getTime();
    tick();
});

var gameObjects = [];
var lastTick;


function tick() {
    var now = new Date();
    var dt = now - lastTick;
    lastTick = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < gameObjects.length; i++) {
        gameObjects[i].update(dt);
        gameObjects[i].draw(ctx);
    }

    requestAnimationFrame(tick);

}


var socket = io('http://localhost:3000');
keyHandler.socket = socket;

socket.on(Actions.INITIAL_STATE, function(data) {
    for (var i = 0; i < data.length; i++) {
    	gameObjects.push(new GameObject({
    		position: data[i].position,
    		spriteHandler: linkSprites,
    		direction: data[i].direction,
    		id: data[i].id
    	}));
    }
});

socket.on(Actions.OBJECT_UPDATE, function(data) {
    var object = _.find(gameObjects, function(object) {
        return object.id === data.id;
    });
    object.position = data.position;
    object.isMoving = data.isMoving;
    object.setDirection(data.direction);
});

socket.on(Actions.ADD_OBJECT, function(data) {
    console.log("ADD");
    gameObjects.push(new GameObject({
        position: data.position,
        spriteHandler: linkSprites,
        direction: data.direction,
        id: data.id
    }));
});

socket.on(Actions.REMOVE_OBJECT, function(id) {
    gameObjects = _.filter(gameObjects, function(object) {
        return object.id !== id;
    });
});

setInterval(function() {
    socket.emit(Actions.HEARTBEAT);
}, 1000);