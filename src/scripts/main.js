'use strict';

var linkSprites = require("./spriteHandlers/link.js");
var _ = require("lodash");

var playerPositon = [30, 30];


var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
linkSprites.load().then(function() {
	lastTick = lastSpriteChange = new Date();
	tick();
});










var direction = DOWN;

function changeDirection(d) {
	direction = d;
	lastSpriteChange = new Date();
}

var lastTick;
var speed = 50;
var sprite = linkSprites.DOWN_ONE;
var lastSpriteChange;

function tick() {
	var now = new Date();
	var dt = now - lastTick;
	lastTick = now;

	if (isKeyPressed(UP_KEY)) {
		playerPositon[1] -= speed * dt / 1000;

		if (direction !== UP) {
			changeDirection(UP);
		}

		sprite = linkSprites.UP_ONE;

		if (now - lastSpriteChange >= 500) {
			lastSpriteChange = now;
			sprite = sprite === linkSprites.UP_ONE ? linkSprites.UP_TWO : linkSprites.UP_ONE;
		}
	}

	else if (isKeyPressed(DOWN_KEY)) {
		playerPositon[1] += speed * dt / 1000;

		if (direction !== UP) {
			changeDirection(UP);
		}

		sprite = linkSprites.DOWN_ONE;

		if (now - lastSpriteChange >= 500) {
			lastSpriteChange = now;
			sprite = sprite === linkSprites.DOWN_ONE ? linkSprites.DOWN_TWO : linkSprites.DOWN_ONE;
		}
	}

	else if (isKeyPressed(LEFT_KEY)) {
		playerPositon[0] -= speed * dt / 1000;
		sprite = linkSprites.LEFT_ONE;

		if (now - lastSpriteChange >= 500) {
			lastSpriteChange = now;
			sprite = sprite === linkSprites.LEFT_ONE ? linkSprites.LEFT_TWO : linkSprites.LEFT_ONE;
		}
	}

	else if (isKeyPressed(RIGHT_KEY)) {
		playerPositon[0] += speed * dt / 1000;
		sprite = linkSprites.RIGHT_ONE;

		if (now - lastSpriteChange >= 500) {
			lastSpriteChange = now;
			sprite = sprite === linkSprites.RIGHT_ONE ? linkSprites.RIGHT_TWO : linkSprites.RIGHT_ONE;
		}
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	requestAnimationFrame(tick);

}