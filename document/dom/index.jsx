var { Event, DOM, Link, Modal, app, cache, WS, async, Check, cookie, is } = require('kem/dom');

//============	 Event 	===============

var e = new Event();

e.on('name', function(a, b, b){
	console.log(arguments);
});

e.emit('name', 'a', 'b', 'c');

e.removeListener('name');

e.removeAllListeners();



//=============  cookie	=================

// set cookie
cookie.init({ day, path, domain, secure }).set({ key1, key2, key3 });

// check exists
cookie.has('key'); 	//	==> true | false

// get cookie
var key1 = cookie.get('key1');

// delete cookie
cookie.remove('key1', 'key2', 'key3');



// ============	 async  =============

async(function(){
	console.log('ok');
});

async.run([
	function(){
		console.log('tab 1');
	},
	function(){
		console.log('tab 2');
	},
	function(){
		console.log('tab n');
	}
]);

async.each(array, function(item){
	console.log(item);
});

async.map([
	function(cb){
		cb(false, 'data1')
	},
	function(cb){
		cb(false, 'data2')
	},
	function(cb){
		cb(true, 'Error')
	}
], function(array_data){
	console.log(array_data)
}).catch(function(e){
	console.log(e)
});

array.map({
	user: function(cb){
		cb(false, {id, name})
	}, 
	post: function(cb){
		cb(false, { post });
	}
}, SuccessFunction
).catch(ErrorFunction);



// ================== 	cache 	====================

cache.set(key, value);
cache.mset({ object });
cache.has(key);
cache.del(key);

cache.push(key, value);
cache.pull(key, { condition });

cache.hset(hash, key, value);
cache.hmset(hash, { object });
cache.hget(hash, key);
cache.hgetall(hash);
cache.hdel(hash, key);
cache.hdel(hash);

// localStorge
cache.setLocal(key, string_or_object);
cache.hasLocal(key);
cache.getLocal(key);
cache.getLocal(key).toArray();
cache.delLocal(key);



// ====================  Check 	======================

var is = new Check();

.id()
.number()
.int()
.string()
.boolean()
.object()
.array()
.date()
.name()
.gender()
.day()
.month()
.year()
.birthday(day, month, year)
.pass()
.email()
.phone()
.username()
.url()
.md5()
.sha1()
.error 
.getError()