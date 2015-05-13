var GameObject = require("./GameObject.js");
var Actions = require("../shared/Actions.js");
var Player = require("./Player.js");
var Pickup = require("./Pickup.js");
var Room = require("./Room.js");
var ObjectTypes = require("../shared/ObjectTypes.js");

var NORTH = 0,
	EAST = 1,
	SOUTH = 2,
	WEST = 3;


class World {
	constructor(attributes) {
		var self = this;
		this.io = attributes.io;
		this.generateMap();
		
		self.lastTick = new Date().getTime();
		setInterval(function() {
			self.tick();
		}, 1000/60);

		// setInterval(function() {
		// 	for (var i = 0; i < self.rooms.length; i++) {
		// 		for (var j = 0; j < self.rooms[i].length; j++) {
		// 			self.spawnRandomItem(self.rooms[i][j]);
		// 		}
		// 	}
		// }, 20000);
	}
	/**
	 * Generate n row of m columns of rooms
	 */
	generateMap() {
		this.rooms = [];
		for (var row = 0; row < 2; row++) {
			this.rooms.push([]);
			for (var col = 0; col < 2; col++) {
				this.rooms[row].push(new Room({
					position: [row, col]
				}));

			}
		}
	}
	/**
	 * Get a Room instance from the rooms array by its id
	 */
	getRoomByID(id) {
		for (var row = 0; row < this.rooms.length; row++) {
			for (var col = 0; col < this.rooms[row].length; col++) {
				if (this.rooms[row][col].id === id) {
					return this.rooms[row][col]
				}
			}
		}
	}
	/**
	 * Add a player to the game and spawn him in the top left room
	 * Identified by his socket
	 */
	addPlayer(socket) {
		var player = new Player({
			socket: socket,
			id: socket.id,
			world: this,
			health: 3,
			room: this.rooms[0][0]
		});
		player.enterRoom(player.room);
		player.spawn();
	}
	removePlayer(socket) {
		socket.player.remove();
	}
	tick() {
		var now = new Date().getTime();
		var dt = now - this.lastTick;
		this.lastTick = now;

		for (var i = 0; i < this.rooms.length; i++) {
			for (var j = 0; j < this.rooms[i].length; j++) {
				this.rooms[i][j].tick(dt);
			}
		}
	}
	getAdjacentRoom(room, direction) {
		var targetPosition = [room.position[0], room.position[1]];

		if (direction === NORTH) {
			targetPosition[0] -= 1;
		}
		if (direction === EAST) {
			targetPosition[1] += 1;
		}
		if (direction === SOUTH) {
			targetPosition[0] += 1;
		}
		if (direction === WEST) {
			targetPosition[1] -= 1;
		}
		if (this.rooms[targetPosition[0]] && this.rooms[targetPosition[0]][targetPosition[1]]) {
			return this.rooms[targetPosition[0]][targetPosition[1]];
		}
		return false;
	}
	// spawnRandomItem(map) {
	// 	var self = this;
	// 	if (this.items.length === 0) {
	// 		var newItem = new Pickup(this);
	// 		newItem.events.on("destroy", function() {
	// 			self.items = [];
	// 			self.sendToEveryone(map.id, Actions.REMOVE_PICKUP, newItem.getObject());
	// 		});
	// 		this.items.push(newItem);
	// 		this.sendToEveryone(map.id, Actions.ADD_PICKUP, newItem.getObject());
	// 	}
	// }
}

module.exports = World;