var GameObject = require("./GameObject.js");
var Actions = require("../shared/Actions.js");
var Player = require("./Player.js");

class World {
	constructor() {
		this.players = {};
		this.ai = {};
		var self = this;
		self.lastTick = new Date().getTime();
		setInterval(function() {
			self.tick();
		}, 1000/60);
	}
	addPlayer(socket) {
		var player = new Player({
			socket: socket,
			id: socket.id
		});
		this.players[socket.id] = player;
		player.socket.emit(Actions.INITIAL_STATE, this.getState());
	}
	removePlayer(socket) {
		delete this.players[socket.id];
	}
	tick() {
		var now = new Date().getTime();
		var dt = now - this.lastTick;
		this.lastTick = now;
		for (var key in this.players) {
			this.players[key].update(dt);
		}
	}
	getState() {
		var state = [];
		for (var key in this.players) {
			state.push(this.players[key].getObject());
		}
		return state;
	}
}

module.exports = World;