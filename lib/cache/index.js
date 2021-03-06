var cache = require('./server');

cache.hasLocal = function (key) {
	return window.localStorage.hasOwnProperty(key);
};
cache.setLocal = function (key, value) {
	window.localStorage.setItem(key, 'object' === typeof value ? JSON.stringify(value) : value);
};
cache.getLocal = function (key) {
	return window.localStorage.getItem(key);
};
cache.delLocal = function (key) {
	window.localStorage.removeItem(key);
};

module.exports = cache;