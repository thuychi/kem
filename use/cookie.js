var Cookie = require('../lib/cookie/server');

module.exports = function cookie_parser(req, res, next){
	req.cookie = new Cookie(req.headers.cookie, res);
	next();
}