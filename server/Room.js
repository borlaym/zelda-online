var ObjectTypes = require("../shared/ObjectTypes.js");
var WorldObject = require("../shared/WorldObject.js");
var Pickup = require("./Pickup.js");
var _ = require("lodash");
var Actions = require("../shared/Actions.js");

class Room {
	constructor(attributes) {
		this.position = attributes.position;
		this.objects = [];
		this.players = new Set();
		this.pickups = [];
		this.io = attributes.io;
		this.world = attributes.world;
		for (var x = 0; x < 16; x++) {
			this.objects.push([]);
			for (var y = 0; y < 11; y++) {
				this.objects[x].push(new WorldObject({
					type: ObjectTypes.FLOOR_DIRT,
					coordinates: [x, y],
					passable: true
				}));
			}
		}
		this.id = "id" + Math.floor(Math.random() * 9999999999);
	}
	generateRandomLayout() {
		//Randomly spawn objects inside the room
		for (var i = 0; i < 10; i++) {
			var x = Math.floor(Math.random() * 12 + 2);
			var y = Math.floor(Math.random() * 7 + 2);
			this.objects[x][y] = new WorldObject({
				type: ObjectTypes.TREE,
				coordinates: [x, y]
			});
		}
		//Place invisible walls on the outside of the rooms
		for (var i = 0; i < 16; i++) {
			for (var j = 0; j < 11; j++) {
				if (i < 2 || i > 13 || j < 2 || j > 8) {
					this.objects[i][j] = new WorldObject({
						type: ObjectTypes.INVISIBLE_WALL,
						passable: false,
						coordinates: [i, j]
					});
				}
			}
		}
		//Place doors
		var doors = []
		for (var direction = 0; direction < 4; direction++) {
			if (this.world.getAdjacentRoom(this, direction)) {
				switch(direction) {
					case 0:
						doors.push([8,0]);
						doors.push([8,1]);
					break;
					case 1:
						doors.push([15,5]);
						doors.push([14,5]);
					break;
					case 2:
						doors.push([8,10]);
						doors.push([8,9]);
					break;
					case 3:
						doors.push([0,5]);
						doors.push([1,5]);
					break;
				}
			}
		}
		console.log(this.position, doors);
		for (var i = 0; i < doors.length; i++) {
			this.objects[doors[i][0]][doors[i][1]] = new WorldObject({
				type: ObjectTypes.FLOOR_DIRT,
				passable: true,
				coordinates:  [doors[i][0], doors[i][1]]
			});
		}
	}
	getState() {
		return {
			players: Array.from(this.players).map(function(player) {
				return player.getState();
			}),
			objects: this.objects,
			pickups: this.pickups.map(function(pickup) {
				return pickup.getState();
			})
		};
	}
	tick(dt) {
		var now = new Date();
		this.players.forEach(function(player) {
			if (now - player.lastHeartbeat > 5000) {
				player.remove();
			} else {
				player.update(dt);
				player.projectiles.forEach(function(projectile) {
					projectile.update(dt);
				});
			}
		});
	}
	/**
	 * Spawns a random pickup on an empty space in this room. Executes every n seconds.
	 * There can only be one pickup present in a room at any one time
	 */
	spawnRandomItem() {

		var self = this;
		if (this.pickups.length === 0) {
			var newItem = new Pickup(this);
			newItem.events.on("destroy", function() {
				self.pickups = [];
				self.io.to(self.id).emit(Actions.REMOVE_PICKUP, newItem.getState());
			});
			this.pickups.push(newItem);
			this.io.to(this.id).emit(Actions.ADD_PICKUP, newItem.getState());
		}

	}
	getEmptySpace() {
		var rndX, rndY, space;
		do {
			rndX = Math.floor(Math.random() * this.objects.length);
			rndY = Math.floor(Math.random() * this.objects[0].length);
			space = this.objects[rndX][rndY];
		} while (!space.passable);
		return [rndX, rndY];
	}
}

module.exports = Room;