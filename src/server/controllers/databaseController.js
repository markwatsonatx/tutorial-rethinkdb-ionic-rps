var r = require('rethinkdb');

module.exports.createDatabase = (conn, databaseName) => {
    return r.dbList().run(conn).then((names) => {
        var dbFound = false;
        for (name of names) {
          if (name == databaseName) {
            dbFound = true;
            break;
          }
        }
        if (! dbFound) {
            console.log('Creating database...');
            return r.dbCreate(databaseName).run(conn);
        }
        else {
            console.log('Database exists.');
            return Promise.resolve({dbs_exists:true});
        }
    });
};

module.exports.createTable = (conn, tableName) => {
    return r.tableList().run(conn).then((names) => {
        var tableFound = false;
        for (name of names) {
          if (name == tableName) {
            tableFound = true;
            break;
          }
        }
        if (! tableFound) {
            console.log('Creating table...');
            return r.tableCreate(tableName).run(conn);
        }
        else {
            console.log('Table exists.');
            return Promise.resolve({table_exists:true});
        }
    });
};