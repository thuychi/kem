// set collection in config file: "redis": { "table": ["user", "chat"] }

var redis = require('kem/db/redis');

var user = redis.user;
var chat = redis.chat;

redis('get', 'key').then(function(value){});
user('get', 'key').then(function(value){});

redis.array([
	redis('get', 'key'),
	user('get', 'key')
], function(array){
	// 
});