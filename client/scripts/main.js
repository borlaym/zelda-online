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


var canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 176;
var ctx = canvas.getContext("2d");
var outputCanvas = document.querySelector("canvas");
var outputctx = outputCanvas.getContext("2d");
outputctx.mozImageSmoothingEnabled = false;
 outputctx.webkitImageSmoothingEnabled = false;
 outputctx.msImageSmoothingEnabled = false;
 outputctx.imageSmoothingEnabled = false;


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

    //Draw base toom image

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

    //Draw world objects

    for (var i = 0; i < room.length; i++) {
        for (var j = 0; j < room[i].length; j++) {
            if (room[i][j]) {
                room[i][j].draw(ctx);
            }
        }
    }

    //Draw pickups

    for (var i = 0; i < pickups.length; i++) {
        pickups[i].draw(ctx);
    }

    //Draw doors below the player
    if (room[0]) {
        //NORTH
        if (room[8][0].passable) {
            ctx.drawImage(worldSprites.image,
                            worldSprites.sprites.DOOR_NORTH[0],
                            worldSprites.sprites.DOOR_NORTH[1],
                            worldSprites.sprites.DOOR_NORTH[2],
                            worldSprites.sprites.DOOR_NORTH[3],
                            7.5 * 16,
                            12,
                            worldSprites.sprites.DOOR_NORTH[2],
                            worldSprites.sprites.DOOR_NORTH[3]
                            );
        }
        //EAST
        if (room[15][5].passable) {
            ctx.drawImage(worldSprites.image,
                            worldSprites.sprites.DOOR_EAST[0],
                            worldSprites.sprites.DOOR_EAST[1],
                            worldSprites.sprites.DOOR_EAST[2],
                            worldSprites.sprites.DOOR_EAST[3],
                            14 * 16,
                            4.5 * 16,
                            worldSprites.sprites.DOOR_EAST[2],
                            worldSprites.sprites.DOOR_EAST[3]
                            );
        }
        //SOUTH
        if (room[8][10].passable) {
            ctx.drawImage(worldSprites.image,
                            worldSprites.sprites.DOOR_SOUTH[0],
                            worldSprites.sprites.DOOR_SOUTH[1],
                            worldSprites.sprites.DOOR_SOUTH[2],
                            worldSprites.sprites.DOOR_SOUTH[3],
                            7.5 * 16,
                            9 * 16,
                            worldSprites.sprites.DOOR_SOUTH[2],
                            worldSprites.sprites.DOOR_SOUTH[3]
                            );
        }
        //WEST
        if (room[0][5].passable) {
            ctx.drawImage(worldSprites.image,
                            worldSprites.sprites.DOOR_WEST[0],
                            worldSprites.sprites.DOOR_WEST[1],
                            worldSprites.sprites.DOOR_WEST[2],
                            worldSprites.sprites.DOOR_WEST[3],
                            12,
                            4.5 * 16,
                            worldSprites.sprites.DOOR_WEST[2],
                            worldSprites.sprites.DOOR_WEST[3]
                            );
        }
        
    }

    //Draw players and other game objects

    for (var i = 0; i < gameObjects.length; i++) {
        gameObjects[i].update(dt);
        gameObjects[i].draw(ctx);
    }

    //Draw doors Above the player
    if (room[0]) {
        //NORTH
        if (room[8][0].passable) {
            ctx.drawImage(worldSprites.image,
                            worldSprites.sprites.DOOR_NORTH2[0],
                            worldSprites.sprites.DOOR_NORTH2[1],
                            worldSprites.sprites.DOOR_NORTH2[2],
                            worldSprites.sprites.DOOR_NORTH2[3],
                            7.5 * 16,
                            12,
                            worldSprites.sprites.DOOR_NORTH2[2],
                            worldSprites.sprites.DOOR_NORTH2[3]
                            );
        }
        //EAST
        if (room[15][5].passable) {
            ctx.drawImage(worldSprites.image,
                            worldSprites.sprites.DOOR_EAST2[0],
                            worldSprites.sprites.DOOR_EAST2[1],
                            worldSprites.sprites.DOOR_EAST2[2],
                            worldSprites.sprites.DOOR_EAST2[3],
                            14 * 16,
                            4.5 * 16,
                            worldSprites.sprites.DOOR_EAST2[2],
                            worldSprites.sprites.DOOR_EAST2[3]
                            );
        }
        //SOUTH
        if (room[8][10].passable) {
            ctx.drawImage(worldSprites.image,
                            worldSprites.sprites.DOOR_SOUTH2[0],
                            worldSprites.sprites.DOOR_SOUTH2[1],
                            worldSprites.sprites.DOOR_SOUTH2[2],
                            worldSprites.sprites.DOOR_SOUTH2[3],
                            7.5 * 16,
                            9 * 16,
                            worldSprites.sprites.DOOR_SOUTH2[2],
                            worldSprites.sprites.DOOR_SOUTH2[3]
                            );
        }
        //WEST
        if (room[0][5].passable) {
            ctx.drawImage(worldSprites.image,
                            worldSprites.sprites.DOOR_WEST2[0],
                            worldSprites.sprites.DOOR_WEST2[1],
                            worldSprites.sprites.DOOR_WEST2[2],
                            worldSprites.sprites.DOOR_WEST2[3],
                            12,
                            4.5 * 16,
                            worldSprites.sprites.DOOR_WEST2[2],
                            worldSprites.sprites.DOOR_WEST2[3]
                            );
        }
        
    }

    //Draw the walls beetween rooms



    outputctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, outputCanvas.width, outputCanvas.height);
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