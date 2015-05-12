var GameObject = require("./GameObject.js");
var Actions = require("../shared/Actions.js");
var Player = require("./Player.js");
var Pickup = require("./Pickup.js");
var Map = require("../shared/Map.js");
var ObjectTypes = require("../shared/ObjectTypes.js");

var NORTH = 0,
	EAST = 1,
	SOUTH = 2,
	WEST = 3


class World {
	constructor(attributes) {
		this.io = attributes.io;
		this.players = {};
		this.ai = {};
		var self = this;
		self.lastTick = new Date().getTime();
		this.maps = [];
		this.generateMap();
		this.items = [];
		setInterval(function() {
			self.tick();
		}, 1000/60);

		// setInterval(function() {
		// 	for (var i = 0; i < self.maps.length; i++) {
		// 		for (var j = 0; j < self.maps[i].length; j++) {
		// 			self.spawnRandomItem(self.maps[i][j]);
		// 		}
		// 	}
		// }, 20000);
	}
	generateMap() {
		for (var row = 0; row < 3; row++) {
			this.maps.push([]);
			for (var col = 0; col < 3; col++) {
				this.maps[row].push(new Map({
					position: [row, col]
				}));

			}
		}
	}
	addPlayer(socket) {
		var player = new Player({
			socket: socket,
			id: socket.id,
			world: this,
			type: ObjectTypes.PLAYER_LINK,
			health: 3,
			map: this.maps[0][0]
		});
		player.socket.join(player.map.id);
		player.spawn();
		player.events.on("change", data => this.sendToEveryone(player.map.id, Actions.OBJECT_UPDATE, player.getObject()));
		player.events.on("projectileSpawned", projectile => this.sendToEveryone(player.map.id, Actions.ADD_OBJECT, projectile.getObject()));
		player.events.on("projectileRemoved", projectile => this.sendToEveryone(player.map.id, Actions.REMOVE_OBJECT, projectile.id));
		player.events.on("projectile:change", projectile => this.sendToEveryone(player.map.id, Actions.OBJECT_UPDATE, projectile.getObject()));
		player.events.on("map:transition", map => {
			player.socket.leave(player.map.id);
			player.socket.join(map.id);
			player.transitionToMap(map);
			player.socket.emit(Actions.INITIAL_STATE, this.getState(player.map));

		});
		this.players[socket.id] = player;
		player.socket.emit(Actions.INITIAL_STATE, this.getState(player.map));
		player.socket.to(player.map.id).emit(Actions.ADD_OBJECT, player.getObject());
	}
	removePlayer(socket) {
		this.sendToEveryone(Actions.REMOVE_OBJECT, socket.id);
		delete this.players[socket.id];
	}
	tick() {
		var now = new Date().getTime();
		var dt = now - this.lastTick;
		this.lastTick = now;
		for (var key in this.players) {
			var player = this.players[key];
			if (now - player.lastHeartbeat > 5000) {
				this.removePlayer(player.socket);
			} else {
				player.update(dt);
				//Update the player's projectiles
				player.projectiles.forEach(function(projectile) {
					projectile.update(dt);
				});
			}
		}
	}
	getEmptySpace() {
		return this.map.getEmptySpace();
	}
	getState(map) {
		var state = {
			players: [],
			map: {},
			// items: []
		};
		for (var key in this.players) {
			state.players.push(this.players[key].getObject());
		}
		// state.items = this.items.map(function(item) {
		// 	return item.getObject();
		// });
		state.map = map.getState();
		return state;
	}
	getAdjacentMap(map, direction) {
		var targetPosition = [map.position[0], map.position[1]];

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
		if (this.maps[targetPosition[0]] && this.maps[targetPosition[0]][targetPosition[1]]) {
			return this.maps[targetPosition[0]][targetPosition[1]];
		}
		return false;
	}
	sendToEveryone(channel, action, data) {
		this.io.to(channel).emit(action, data);
	}
	spawnRandomItem(map) {
		var self = this;
		if (this.items.length === 0) {
			var newItem = new Pickup(this);
			newItem.events.on("destroy", function() {
				self.items = [];
				self.sendToEveryone(map.id, Actions.REMOVE_PICKUP, newItem.getObject());
			});
			this.items.push(newItem);
			this.sendToEveryone(map.id, Actions.ADD_PICKUP, newItem.getObject());
		}
	}
}

module.exports = World;