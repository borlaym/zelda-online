Play it here: [http://borlaym.github.io/zelda-online/](http://borlaym.github.io/zelda-online/)

To run a local server:
- Clone the repository
- Run npm install
- Run node server/server.js to start the server
- Run grunt serve to run the web server serving the client side

The game uses HTML5 2d Canvas for the front end rendering, all game logic runs on a node.js server. The two communicate via socket.io.