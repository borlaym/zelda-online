var pressedKeys = [];

window.addEventListener("keydown", function(a) {
	pressedKeys.push(a.which);
	pressedKeys = _.unique(pressedKeys);
});

window.addEventListener("keyup", function(a) {
	pressedKeys = _.filter(pressedKeys, function(key) {
		return key !== a.which
	});
});

module.exports = {
	keys: {
		UP_KEY = 87,
		LEFT_KEY = 65,
		RIGHT_KEY = 68,
		DOWN_KEY = 83
	},
	isKeyPressed : function(key) {
		return pressedKeys.indexOf(key) > -1;
	}
}