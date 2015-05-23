var Actions = require("../../shared/Actions.js");

var keys = {
	UP : 87,
	LEFT : 65,
	RIGHT : 68,
	DOWN : 83,
	UP_ALT: 38,
	LEFT_ALT: 37,
	RIGHT_ALT: 39,
	DOWN_ALT: 40,
	A: 79
}
var pressedKeys = [];

var Object = {
	handleKeydown: function(key) {
		var direction;
		switch(key) {
			case keys.UP:
			case keys.UP_ALT:
				this.socket.emit(Actions.START_MOVING, 0);
				break;
			case keys.RIGHT:
			case keys.RIGHT_ALT:
				this.socket.emit(Actions.START_MOVING, 1);
				break;
			case keys.DOWN:
			case keys.DOWN_ALT:
				this.socket.emit(Actions.START_MOVING, 2);
				break;
			case keys.LEFT:
			case keys.LEFT_ALT:
				this.socket.emit(Actions.START_MOVING, 3);
				break;
			case keys.A:
				this.socket.emit(Actions.ATTACK, 3);
				break;
		}
	},
	handleKeyUp: function(key) {
		if (pressedKeys.length === 0) {
			this.socket.emit(Actions.STOP_MOVING);
		}
	}
}


window.addEventListener("keydown", function(a) {
	if (pressedKeys.indexOf(a.which) === -1) {
		Object.handleKeydown(a.which);
	}
	pressedKeys.push(a.which);
	pressedKeys = _.unique(pressedKeys);
});

window.addEventListener("keyup", function(a) {
	pressedKeys = _.filter(pressedKeys, function(key) {
		return key !== a.which
	});
	Object.handleKeyUp(a.which);
});



module.exports = Object;