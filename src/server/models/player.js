var uuid = require('node-uuid');

class Player {
    // Constructor
    constructor() {
        this.id = uuid.v4();
        this.moves = [];
    }
}

// export the class
module.exports = Player;