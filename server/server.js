require("babel/register");
var app = require('express')();
var cors = require("cors");
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(cors());
io.set("origins", "*:*");
var World = require("./World.js");

var world = new World({
	io: io
});

io.on('connection', function(socket){
  console.log('a user connected with id ' + socket.id);
  world.addPlayer(socket);

  socket.on("disconnect", function() {
  	console.log("user disconnected with id " + socket.id);
    world.removePlayer(socket);
  });
	
});

http.listen(5000, function(){
});