var cache = {
	_set: {},
	_hset: {}
};

/* using for _set */
cache.set = function (key, val) {
	this._set[key] = val;
};
cache.has = function (key) {
	return this._set.hasOwnProperty(key);
};
cache.get = function (key) {
	return this._set[key];
};
cache.mset = function (list) {
	Object.assign(this._set, list);
};
cache.del = function (key) {
	delete this._set[key];
};
cache.push = function (key, value) {
	this.has(key) ? this._set[key].push(value) : this._set[key] = [value];
};
cache.pull = function (key, condition) {
	var array = this._set[key];
	if (array) this._set[key].remove(condition);
};

/* using for _hset */
cache.hset = function (hash, key, value) {
	this._hset[hash] = this._hset[hash] || {};
	this._hset[hash][key] = value;
};
cache.hmset = function (hash, list) {
	/* multi hash set */
	this._hset[hash] = this._hset[hash] || {};
	Object.assign(this._hset[hash], list);
};
cache.hget = function (hash, key) {
	var value = this._hset[hash];
	return value ? value[key] : null;
};
cache.hgetall = function (hash) {
	return this._hset[hash];
};
cache.hdel = function (hash, key) {
	if (key) {
		if (this._hset.hasOwnProperty(hash)) delete this._hset[hash][key];
	} else {
		delete this._hset[hash];
	}
};

/* the other */
cache.is = function (hash, key, value) {
	return 'undefined' === typeof value ? key === this.get(hash) : value === this.hget(hash, key);
};

module.exports = cache;