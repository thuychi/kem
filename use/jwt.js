var jwt = require('jsonwebtoken'), secretKey = process.env.secret;

function JWT(req, req, next){
	var token = req.body.token || req.query.token || req.headers.token;
	if(token){
		jwt.verify(token, secretKey, function(error, data){
			if(error){
				res.writeHead(401, {'Content-Type': 'application/json'});
				res.end(JSON.stringify({ error: true, code: 401, message: 'Failed to authenticate token' }));
			}else{
				req.user = data;
				next()
			}
		})
	}else{
		res.writeHead(403, {'Content-Type': 'application/json'});
		res.end(JSON.stringify({ error: true, code: 403, message: 'No token provided' }));
	}
}

JWT.create = function(user, day){
	return jwt.sign(user, secretKey, {expiresIn: day || '30 days'});
}

JWT.require = function(key, operator, value){
	return function(req, res, next){
		var token = req.body.token || req.query.token || req.headers.token;
		if(token){
			jwt.verify(token, secretKey, function(error, data){
				if(!error){
					if((operator && eval('req.user.' + key + operator + value)) || (!operator && req.user[key])){
						req.user = data;
						return next();
					}
				}

				res.writeHead(401, {'Content-Type': 'application/json'});
				res.end(JSON.stringify({ error: true, code: 401, message: 'Failed to authenticate token' }));
			})
		}else{
			res.writeHead(403, {'Content-Type': 'application/json'});
			res.end(JSON.stringify({ error: true, code: 403, message: 'No token provided' }));
		}
	}
}

module.exports = JWT;