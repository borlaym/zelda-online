var GameObject = require("./GameObject.js");
var Actions = require("../shared/Actions.js");
var Player = require("./Player.js");
var Map = require("../shared/Map.js");
var ObjectTypes = require("../shared/ObjectTypes.js");

class World {
	constructor() {
		this.players = {};
		this.ai = {};
		var self = this;
		self.lastTick = new Date().getTime();
		this.generateMap();
		setInterval(function() {
			self.tick();
		}, 1000/60);
	}
	generateMap() {
		this.map = new Map();
	}
	addPlayer(socket) {
		var player = new Player({
			socket: socket,
			id: socket.id,
			world: this,
			type: ObjectTypes.PLAYER_LINK,
			health: 3
		});
		player.events.on("change", data => this.sendToEveryone(Actions.OBJECT_UPDATE, player.getObject()));
		player.events.on("projectileSpawned", projectile => this.sendToEveryone(Actions.ADD_OBJECT, projectile.getObject()));
		player.events.on("projectileRemoved", projectile => this.sendToEveryone(Actions.REMOVE_OBJECT, projectile.id));
		player.events.on("projectile:change", projectile => this.sendToEveryone(Actions.OBJECT_UPDATE, projectile.getObject()));
		player.events.on("die", noparam => this.removePlayer(player.socket));
		this.players[socket.id] = player;
		player.socket.emit(Actions.INITIAL_STATE, this.getState());
		player.socket.broadcast.emit(Actions.ADD_OBJECT, player.getObject());
	}
	removePlayer(socket) {
		this.sendToEveryone(Actions.REMOVE_OBJECT, socket.id);
		delete this.players[socket.id];
	}
	tick() {
		var now = new Date().getTime();
		var dt = now - this.lastTick;
		console.log(dt);
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
	getState() {
		var state = {
			players: [],
			map: {}
		};
		for (var key in this.players) {
			state.players.push(this.players[key].getObject());
		}
		state.map = this.map.getState();
		return state;
	}
	sendToEveryone(action, data) {
		for (var key in this.players) {
			this.players[key].socket.emit(action, data);
		}
	}
}

module.exports = World;