var Reply = require('./mvc/controller.js'),
	URL = require('url');

var App = {
	routes: [],
	server: null,
	define: {},

	Error: function(req, res){
		res.writeHead(404, {'Content-Type': 'text/html'});
		res.end('error');
	},

	set: function(key, value){
		this.define[key] = value;
	},
	get: function(key){
		return this.define[key];
	},

	Server: function(http){
		this.server = http.createServer(this.handle.bind(this)).listen(process.env.port, process.env.host);
		return this;
	},
	error: function(fn){
		this.Error = fn;
	},

	use: function(...array){
		switch(array.length){
			case 1:
				this.routes.push({ fn: array[0] });
				return;
			case 2:
				this.routes.push({ uri: new RegExp('^' + array[0] + '$'), fn: array[1] });
				return;
			case 3:
				this.routes.push({ uri: new RegExp('^' + array[0] + '$'), fn: array[2], check: array[1] });
				return;
		}
	},
	handle: function(req, res){
		var routes = this.routes, n = routes.length;
		if(!n || req.url==='/favicon.ico') return res.end();

		req.url = URL.parse(req.url);

		var pathname = req.url.pathname, m, route, fn;

		routes.push({ fn: this.Error });

		function next(i){
			if(i > n) return;

			route = routes[i];

			if(route.uri){

				if(m = route.uri.exec(pathname)){

					function finish(){
						controller = new route.fn();

						if(fn = controller[req.method.toLowerCase()]){
							m[0] = new Reply(req, res);
							fn.apply(null, m);
						}
					}

					return route.check ? route.check(req, res, finish) : finish()
				}

				next(++i)
			}else{
				route.fn(req, res, function(){ next(++i) })
			}
		}

		next(0)
	}
}

module.exports = App;