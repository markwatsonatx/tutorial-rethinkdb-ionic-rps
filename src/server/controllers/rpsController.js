var gameController = require('./gameController');
var Client = require('../models/client');

var clients = [];

var onMessage = (client, message, app) => {
    if (message.command == 'join') {
        gameController.joinOrCreateGame(client, app)
            .then(() => {
                console.log('User ' + client.player.id + ' joined game.');
            }).error((err) => {
                console.log('Join game failed: ' + err);
            });
    }
    else if (message.command == 'playMove') {
        gameController.playMove(client, message.move, app)
            .then(() => {
                console.log('User ' + client.player.id + ' played move.');
            })
            .error(() => {
                console.log('Error playing move.');
            });
    }
    else if (message.command == 'quit') {
        gameController.quitGame(client);
    }
};

module.exports.onConnection = (app, request) => {
    console.log((new Date()) + ' WebSocket connection accepted.');
    var connection = request.accept('rps', request.origin);
    var client = new Client(connection);
    clients.push(client);
    connection.on('message', (message) => {
        if (message.type === 'utf8') {
            console.log('WebSocket server received message: ' + message.utf8Data);
            onMessage(client, JSON.parse(message.utf8Data), app);
        }
    });
    connection.on('close', () => {
        clients.splice(clients.indexOf(client), 1);
        console.log((new Date()) + 'WebSocket client ' + connection.remoteAddress + ' disconnected.');
    });
};