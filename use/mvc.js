var fs = require('fs'),
	Response = require('../mvc/controller.js'),

	ListController = {},
	dirname = process.env.app + '/controller/',
	files = fs.readdirSync(dirname),
	fn = null,

	param,
	method,
	controller,
	action;

for(var i = 0, n = files.length; i < n; i++){
	ListController[files[i].slice(0, -3)] = new (require(dirname + files[i]))();
}

module.exports = function callback(req, res, next){

	param = req.pathname.substr(1).split('/');

	if(controller = ListController[param.shift() || 'index']){
		method = req.method.toLowerCase();
		action = [method, param[0] || 'index'].join('_');

		if(fn = controller[action]){

			param[0] = new Response(req, res);
			fn.apply(null, param);

			return;
		}
	}

	next()
}