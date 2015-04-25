'use strict';

var linkSprites = require("./spriteHandlers/link.js");
var _ = require("lodash");
var io = require("socket.io-client");
var Actions = require("../../shared/Actions.js");


var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
linkSprites.load().then(function() {
    tick();
});

var gameObjects = [];

function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < gameObjects.length; i++) {
        gameObjects[i].draw(ctx);
    }

    requestAnimationFrame(tick);

}


var socket = io('http://localhost:3000');

socket.on(Actions.INITIAL_STATE, function(data) {
    console.log(data);
});