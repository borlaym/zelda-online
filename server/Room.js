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
		this.generateRandomLayout();
		this.id = "id" + Math.floor(Math.random() * 9999999999);
	}
	generateRandomLayout() {
		for (var i = 0; i < 15; i++) {
			var x = Math.floor(Math.random() * 16);
			var y = Math.floor(Math.random() * 11);
			this.objects[x][y] = new WorldObject({
				type: ObjectTypes.TREE,
				coordinates: [x, y]
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
		} while (space.type !== ObjectTypes.FLOOR_DIRT && rndX !== 0 && rndY !== 0 && rndX !== this.objects.length - 1 && rndY !== this.objects[0].length - 1);
		return [rndX, rndY];
	}
}

module.exports = Room;