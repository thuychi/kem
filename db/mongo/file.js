var DB = require('./db'),
    ObjectID = require('mongodb').ObjectId,
    Grid = require('mongodb').GridStore;

DB.write = function (binary, content_type, fn) {
	DB.then(function (db) {
		var filename = new ObjectID(),
		    gs = new Grid(db, filename, 'w', { content_type });

		gs.open(function (e, gs) {
			if (e) return fn();

			gs.write(binary);
			gs.close();

			fn(filename.toString());
		});
	});
};

DB.read = function (filename, fn) {
	DB.then(function (db) {
		var gs = new Grid(db, new ObjectID(filename), 'r');
		gs.open(function (e, gs) {
			return gs ? fn(gs.contentType, gs.stream(true)) : fn();
		});
	});
};

DB.remove = function (filename) {
	DB.then(function (db) {
		Grid.unlink(db, new ObjectID(filename));
	});
};

module.exports = DB;