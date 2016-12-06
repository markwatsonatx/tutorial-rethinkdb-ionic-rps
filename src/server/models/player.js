var uuid = require('node-uuid');

// Constructor
function Player() {
    this.id = uuid.v4();
    this.moves = [];
}

// export the class
module.exports = Player;