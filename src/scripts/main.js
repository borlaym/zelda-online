'use strict';

var linkSprites = require("./spriteHandlers/link.js");
var _ = require("lodash");
var Player = require("./Player.js");


var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
linkSprites.load().then(function() {
	lastTick = new Date();
	tick();
});

var player = new Player();

var gameObjects = [player];

var lastTick;

function tick() {
	var now = new Date();
	var dt = now - lastTick;
	lastTick = now;

	for (var i = 0; i < gameObjects.length; i++) {
		gameObjects[i].update(dt);
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (var i = 0; i < gameObjects.length; i++) {
		gameObjects[i].draw(ctx);
	}
	
	requestAnimationFrame(tick);

}