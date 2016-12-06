var config = require("./config");
var cfenv = require('cfenv');
var express = require('express');
var http = require('http');
var r = require('rethinkdb');
var databaseController = require('./controllers/databaseController');
var rpsController = require('./controllers/rpsController');
var WebSocketServer = require('websocket').server;

var webSocketServer;
var games = [];

var app = express();

(function(app) {
  r.connect(config.rethinkdb, (err, conn) => {
    if (err) {
      console.log(new Date() + ' Could not open a connection to RethinkDB.');
      console.log(new Date() + ' ' + err.message);
    }
    else {
      console.log(new Date() + ' Connected to RethinkDB.');
      app.set('rethinkdb-conn', conn);
      databaseController.createDatabase(conn, config.rethinkdb.db)
        .then(() => {
          return databaseController.createTable(conn, 'games');
        })
        .catch((err) => {
          console.log(new Date() + ' Error creating database and/or table: ' + err); 
        });
    }
  });

  // Create Websocket Server
  var server = http.createServer((request, response) => {
    console.log((new Date()) + ' WebSocket server received request for ' + request.url);
    response.writeHead(404);
    response.end();
  });
  server.listen(config.websocket.port, () => {
    console.log((new Date()) + ' WebSocket server is listening on port ' + config.websocket.port);
  });

  webSocketServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
  });

  function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
  }

  webSocketServer.on('request', (request) => {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' WebSocket connection from origin ' + request.origin + ' rejected.');
      return;
    }
    rpsController.onConnection(app, request);

  });
})(app);

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', () => {
  // print a message when the server starts listening
  console.log(new Date() + ' Server starting on ' + appEnv.url);
});