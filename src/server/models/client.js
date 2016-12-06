var uuid = require('node-uuid');
var Player = require('./player');
var r = require('rethinkdb');

// Constructor
function Client(connection) {
    // always initialize all instance properties
    this.connection = connection;
    this.player = new Player();
}

Client.prototype.onJoinedGame = function(gameId, player1, app) {
    this.gameId = gameId;
    this.player1 = player1;
    var wsConn = this.connection;
    var rdbConn = app.get('rethinkdb-conn');
    r.table('games').get(this.gameId).changes({includeInitial:true}).run(rdbConn, function(err, cursor) {
        if (err) {
            throw err;
        }
        cursor.each(function(err, row) {
            if (err) {
                throw err;
            }
            else {
                var gameJson = JSON.stringify(row.new_val, null, 2);
                console.log(gameJson);
                wsConn.sendUTF(gameJson);
            }
        });
    });
};

// export the class
module.exports = Client;