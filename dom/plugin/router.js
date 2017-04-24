var DOM = require('../lib/dom.js'), async = require('../../lib/async.js');

var App = module.exports = {
	pushState: true,
	routes: [],
	event: {},
	dom: document.getElementById('app'),
	Error: DOM.createElement('div', {id: 'error-page'}, 'This page not found!'),

	on: function(name, fn){
		if(!this.event[name]) this.event[name] = [];
		this.event[name].push(fn);
	},
	emit: function(name, ...data){
		async.each(this.event[name] || [], function(fn){
			fn.apply(null, data)
		})
	},

	error: function(fn){
		this.Error = fn;
	},

	use: function(uri, fn, action){
		switch(arguments.length){
			case 1:
				this.routes.push({ fn: arguments[0] });
				return;
			case 2:
				this.routes.push({ uri: new RegExp('^' + arguments[0] + '$'), fn: arguments[1] });
				return;
			case 3:
				if('string' === typeof arguments[2]){
					this.routes.push({ uri: new RegExp('^' + arguments[0] + '$'), fn: arguments[1], action: arguments[2] });
				}else{
					this.routes.push({ uri: new RegExp('^' + arguments[0] + '$'), fn: arguments[2], check: arguments[1] });
				};
				return;
			case 4:
				this.routes.push({ uri: new RegExp('^' + arguments[0] + '$'), fn: arguments[2], check: arguments[1], action: arguments[3] });
		}
	},
	handle: function(){

		this.dom.appendChild(new Comment());

		var routes = this.routes, 
			n = routes.length, 
			m, route, controller, current_match;

		this.routes.push({ fn: this.Error });

		this.on('render', function(pathname){

			function next(i){
				if(i > n) return;

				route = routes[i];

				if(route.uri){
					if(r = route.uri.exec(pathname)){

						function finish(){
							if(!controller) controller = new route.fn();

							if(current_match !== route.uri){
								current_match = route.uri;
								controller = new route.fn();

								app.replaceChild(controller.done, app.childNodes[0]);
							}

							var action = route.action || r[1] || 'index';
							var Section = controller[action].apply(null, r.slice(2));

							controller.emit('section', DOM.createElement(Section));

							if(controller.header) controller.emit('header', controller.header());

							if(controller.footer) controller.emit('footer', controller.footer());
						}

						return route.check ? route.check(finish) : finish();
					}else{
						next(++i);
					}
				}else{
					route.fn(function(){ next(++i) })
				}
			}

			next(0);
			if(App.pushState){
				window.history.pushState(null, null, pathname);
			}
		});

		if(App.pushState){
			window.addEventListener('popstate', function (){
				App.emit('render', window.location.pathname);
			});
			this.emit('render', window.location.pathname);
		}else{
			this.emit('render', '/');
		}
	}
}