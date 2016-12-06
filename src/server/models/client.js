var uuid = require('node-uuid');
var Player = require('./player');
var r = require('rethinkdb');

// Constructor
class Client {

    constructor(connection) {
        // always initialize all instance properties
        this.connection = connection;
        this.player = new Player();
        this.cursor = null;
    }

    onJoinedGame(gameId, player1, app) {
        this.gameId = gameId;
        this.player1 = player1;
        var wsConn = this.connection;
        var rdbConn = app.get('rethinkdb-conn');
        r.table('games').get(this.gameId).changes({includeInitial: true}).run(rdbConn, (err, cursor) => {
            this.cursor = cursor;
            if (err) {
                throw err;
            }
            this.cursor.each(function (err, row) {
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
    }

    onQuitGame() {
        if (this.cursor) {
            this.cursor.close();
            this.cursor = null;
        }
    }
}

// export the class
module.exports = Client;