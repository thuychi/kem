var URL = querystring = require('querystring'), url;
var ListMethod = {PUT: 1, POST: 1, DELETE: 1};

module.exports = function body_parser(req, res, next){

	url = req.url;

	req.pathname = url.pathname;
	req.query = querystring.parse(url.query);

	if(ListMethod[req.method]){
		var array_buffer = [];

		req.on('data', function(buffer){
			array_buffer.push(buffer)
		})

		req.on('end', function(){
			req.bin = Buffer.concat(array_buffer);

			req.body = querystring.parse(req.bin.toString());
			res.end(JSON.stringify(req.body));
		})
	}

	next()
}