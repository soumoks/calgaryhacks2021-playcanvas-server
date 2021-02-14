const http = require('http')

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World');
  });


var io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

var players = {};



function Player (id, name, color) {
    this.id = id;
    this.name = name;
    this.color = color
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.rx = 0;
    this.ry = 0;
    this.rz = 0;
    this.entity = null;
}

io.sockets.on('connection', function(socket) {
    socket.on ('initialize', function (name) {
        console.log(name, "has connected!")
        var id = socket.id;
        const colors = ["red color", "purple color", "green color", "black color"];

        const random = Math.floor(Math.random() * colors.length);
        var newPlayer = new Player (id, name, colors[random]);
        // Creates a new player object with a unique ID number.

        players[id] = newPlayer;
        // Adds the newly created player to the array.

        socket.emit ('playerData', {id: id, players: players});
        // Sends the connecting client his unique ID, and data about the other players already connected.

        socket.broadcast.emit ('playerJoined', newPlayer);
        // Sends everyone except the connecting player data about the new player.
    });
    
    socket.on ('positionUpdate', function (data) {
      try {
        players[data.id].x = data.x;
        players[data.id].y = data.y;
        players[data.id].z = data.z;
        players[data.id].rx = data.rx;
      }
      catch(err) {

      }

      socket.broadcast.emit ('playerMoved', data);
    });
    
    socket.on('disconnect', function() {
      console.log('Got disconnect!', socket.id);
      delete players[socket.id]
      socket.broadcast.emit ('playerDisconnected', socket.id);
      // Sends the removed player's ID to each of the remaining players
   });
});

var portNum = 80
console.log ('Server started on port: ', portNum);
server.listen(portNum);