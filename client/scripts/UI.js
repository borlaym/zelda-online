var $ = require("zepto-browserify").$;


module.exports = {
	drawMap: function(data) {
		var html = "<table>";
		for (var i = 0; i < data.length; i++) {
			html += "<tr>";
			for (var j = 0; j < data[i].length; j++) {
				html += "<td></td>"
			}
			html += "</tr>"
		}
		html +="</table>";
		$(".map").html(html);
	},
	currentRoom: function(pos) {
		console.log($(".map tr").length);
		$(".map td").removeClass("current");
		$(".map tr").eq(pos[1]).find("td").eq(pos[0]).addClass("current");
	}
}