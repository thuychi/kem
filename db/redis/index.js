/* file config: sudo nano /etc/redis/redis.conf */
var define = process.env.redis;
var Redis = require('redis-fast-driver');
var DATABASE = {};

function Database(name) {
	var redis = new Redis({
		port: define.port,
		host: define.host
	});
	redis.rawCall(['select', name]);
	return function (...array) {
		return new Promise(function (resolve, reject) {
			redis.rawCall(array, function (error, row) {
				error ? reject(error) : row ? resolve(row) : reject();
			});
		});
	};
};

DATABASE = new Database(0);
DATABASE.array = function (array, fn) {
	var promise = Promise.all(array);
	return fn ? promise.then(fn) : promise;
};

define.table.forEach(function(table, index){
	DATABASE[table] = new Database(index + 1);
});

module.exports = DATABASE;