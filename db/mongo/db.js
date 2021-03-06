var mongo = require('mongodb'),
	define = process.env.mongodb,
    MongoClient = mongo.MongoClient,
    COLLECTION = {};

var DB = new Promise(function (resolve, reject) {
	MongoClient.connect('mongodb://' + define.url, define.option, { native_parser: true }, function (e, db) {
		return e ? reject(e) : resolve(db);
	});
});
DB.get = function (name) {
	if (!COLLECTION.hasOwnProperty(name)) COLLECTION[name] = DB.then(function (db) { return db.collection(name) });
	return COLLECTION[name];
};

module.exports = DB;