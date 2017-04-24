require('./config.js');

var app = require('kem').Server(require('http'));

// using middleware
app.use(function(req, res, next){});

// using cookie
app.use(require('kem/use/cookie'));

// using body
app.use(require('kem/use/body'));

// using json web token
app.use(require('kem/use/jwt'));

// using router
class IndexController {

	get(reply){
		
		// send string or buffer
		reply.end('hello');

		// send json
		reply.json({ object });

		// send file html in view dir
		reply.html('folder.filename', { object });
	}

	post(reply){

		// query string to object
		console.log(reply.query);
		
		// data from post
		console.log(reply.body);

		// using upload file
		console.log(reply.bin);

		// using cookie
		console.log(reply.cookie);
	}

	put(r){}

	delete(r){}
}

class PostController {
	get(r, username, post_id){
		r.html('post.index', { username, post_id });
	}
}

app.use('/', IndexController);
app.use('/([0-9a-z\.]+)/posts/([0-9]+)', PostController);

// using websocket
require('kem/ws');