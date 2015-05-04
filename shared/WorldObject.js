class WorldObject {
	constructor(attributes) {
		attributes = attributes || {};
		this.id = attributes.id;
		this.type = attributes.type;
		this.coordinates = attributes.coordinates;
		this.passable = attributes.passable || false;
	}
	getPosition() {
		return [this.coordinates[0] * 16, this.coordinates[1] * 16];
	}
}

module.exports = WorldObject;