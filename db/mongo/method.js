var MongoMethod = module.exports = {
	Find: function (db, array) {
		var fn, promise;

		if ('function' === typeof array[array.length - 1]) {
			fn = array.pop();
		}

		promise = db.then(function (collection) {
			return collection.find(array[0] || {}, array[1] || {}, array[2] || {}).toArray();
		});

		return fn ? promise.then(fn) : promise;
	},
	FindOne: function (db, array) {
		var fn, promise;

		if ('function' === typeof array[array.length - 1]) {
			fn = array.pop();
		}

		promise = db.then(function (collection) {
			return collection.find(array[0] || {}, array[1] || {}, {limit: 1}).next();
		});

		return fn ? promise.then(fn) : promise;
	},
	Insert: function (db, data) {
		return db.then(function (collection) {
			return collection.insert(data);
		});
	},
	Save: function (db, data) {
		return db.then(function (collection) {
			return collection.save(data);
		});
	},
	Update: function (db, array) {
		return array[2] ? db.then(function (collection) {
			return collection.update(array[0], array[1], array[2]);
		}) : db.then(function (collection) {
			return collection.update(array[0], array[1]);
		});
	},
	Remove: function (db, where) {
		return db.then(function (collection) {
			return collection.remove(where);
		});
	},
	Aggregate: function (db, array) {
		return db.then(function (collection) {
			return collection.aggregate(array).toArray();
		});
	},
	FindAndModify: function (db, object, fn) {
		var promise = db.then(function (collection) {
			return collection.findAndModify(object);
		});
		return fn ? promise.then(fn) : promise;
	},
	CreateIndex: function(array){
		db.then(function(collection){
			collection.createIndex(array[0], array[1]);
		});
	}
}