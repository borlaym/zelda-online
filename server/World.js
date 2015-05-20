var GameObject = require("./GameObject.js");
var Actions = require("../shared/Actions.js");
var Player = require("./Player.js");
var Room = require("./Room.js");
var ObjectTypes = require("../shared/ObjectTypes.js");
var _ = require("lodash");

var NORTH = 0,
	EAST = 1,
	SOUTH = 2,
	WEST = 3;


class World {
	constructor(attributes) {
		var self = this;
		this.io = attributes.io;
		this.generateMap();

		this.leaderboard = {};
		
		self.lastTick = new Date().getTime();
		setInterval(function() {
			self.tick();
		}, 1000/60);

		setInterval(function() {
			for (var i = 0; i < self.rooms.length; i++) {
				for (var j = 0; j < self.rooms[i].length; j++) {
					self.rooms[i][j].spawnRandomItem();
				}
			}
		}, 15000);
	}
	/**
	 * Generate n row of m columns of rooms
	 */
	generateMap() {
		this.rooms = [];
		for (var x = 0; x < 3; x++) {
			this.rooms.push([]);
			for (var y = 0; y < 3; y++) {
				this.rooms[x].push(new Room({
					position: [x, y],
					io: this.io,
					world: this
				}));

			}
		}
		//Once all rooms are in place, generate a layout for each one
		for (var x = 0; x < this.rooms.length; x++) {
			for (var y = 0; y < this.rooms[x].length; y++) {
				this.rooms[x][y].generateRandomLayout();
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
		
		//Managing player scores
		var self = this;
		player.events.on("pointchange", function(amount) {
			self.leaderboard[player.id] += amount;
			self.leaderboardChange();
		});
		player.events.on("takepointsfrom", function(from) {
			self.leaderboard[player.id] += self.leaderboard[from.id];
			self.leaderboard[from.id] = 0;
			self.leaderboardChange();
		});
		this.leaderboard[player.id] = 0;
		this.leaderboardChange();
	}
	removePlayer(socket) {
		socket.player.remove();
		delete this.leaderboard[socket.id];
		this.leaderboardChange();
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
	/**
	 * Checks if there is a room adjacent to the given one in a direction. Returns false or the room.
	 * @param  {[type]} room      [description]
	 * @param  {[type]} direction [description]
	 * @return {[type]}           [description]
	 */
	getAdjacentRoom(room, direction) {
		var targetPosition = [room.position[0], room.position[1]];

		if (direction === NORTH) {
			targetPosition[1] -= 1;
		}
		if (direction === EAST) {
			targetPosition[0] += 1;
		}
		if (direction === SOUTH) {
			targetPosition[1] += 1;
		}
		if (direction === WEST) {
			targetPosition[0] -= 1;
		}
		if (this.rooms[targetPosition[0]] && this.rooms[targetPosition[0]][targetPosition[1]]) {
			return this.rooms[targetPosition[0]][targetPosition[1]];
		}
		return false;
	}
	/**
	 * Returns a sorted array of players and their scores
	 * @return {Array}
	 */
	getLeaderboard() {
		var values = [];
		for (var key in this.leaderboard) {
			values.push({
				name : this.io.sockets.connected[key].player.name,
				score: this.leaderboard[key]
			});
		}
		return _.sortBy(values, function(player) {
			return player.score;
		}).reverse();
	}
	/**
	 * Called every time a player's score changes
	 */
	leaderboardChange() {
		this.io.emit(Actions.LEADERBOARD_CHANGE, this.getLeaderboard());
	}
	
}

module.exports = World;