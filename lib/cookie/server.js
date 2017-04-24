var querystring = require('querystring');

function encode(value){
	return encodeURIComponent(value)
}

function decode(value){
	return decodeURIComponent(value)
}

module.exports = function Cookie(cookie_string, response){
	this.define = '';
	this.data = querystring.parse(cookie_string, '; ') || {};

	this.init = function(set){
		var date = new Date(),
		    time = set.day || 1,
		    path = set.path || '/';
		date.setTime(date.getTime() + time * 24 * 3600000);

		var array = ['expires=' + date.toUTCString(), 'path=' + path];
		if (set.host) array.push('domain=' + set.host);
		if (set.secure) array.push('secure=' + set.secure);
		if (set.http) array.push('httpOnly=' + set.http);

		this.define = array.join(';');
		return this;
	}

	this.set = function(key, value){
		var array = value === undefined ? key : {[key]: value}, list = [];

		for (var i in array) {
			var key = encode(i), value = encode(array[i]);
			list.push(key + '=' + value + ';' + this.define);
			this.data[key] = value;
		}

		response.setHeader('Set-Cookie', list);
	}

	this.has = function(name){
		return !!this.data[name];
	}

	this.get = function(name){
		return this.data[name];
	}

	this.remove = function(...array){
		if (!this.define) this.init({ day: -1, path: '/' });

		var list = [];

		for (var i = 0, n = array.length; i < n; i++) {
			list.push(encode(array[i]) + '=;' + this.define);
			delete this.data[encode(array[i])];
		}

		response.setHeader('Set-Cookie', list);
	}
}