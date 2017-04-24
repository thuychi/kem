var app = require('../index.js'),
	SocketServer = require('./Server'),
	async = require('../lib/async'),
	jwt = require('jsonwebtoken'),
	server = app.server,
	verifyClient = false,
	dirname = process.env.socket + '/',
	secretKey = process.env.secret,
	WebSocketServer = null;

if(secretKey && process.env.verifySocket){
	verifyClient = function(info, cb){
		var token = info.req.headers.token;
		if(token){
			jwt.verify(token, secretKey, function(error, array_data){
				if(error){
					cb(false, 401, 'Unauthorized');
				}else{
					info.req.user = array_data;
					cb(true);
				}
			})
		}else{
			cb(false, 401, 'Unauthorized');
		}
	}
}

WebSocketServer = new SocketServer({ server, verifyClient });

async.each(require('fs').readdirSync(dirname), function(filename){
	require(dirname + filename)
});

module.exports = WebSocketServer;

/*

- info: origin, req, secure (Is req.connection.authorized or req.connection.encrypted set?)
- cb(result, code, name)

var io = new WebSocketServer({
    verifyClient: function (info, cb) {
        var token = info.req.headers.token
        if (!token)
            cb(false, 401, 'Unauthorized')
        else {
            jwt.verify(token, 'secret-key', function (err, array_data) {
                if (err) {
                    cb(false, 401, 'Unauthorized')
                } else {
                    info.req.user = array_data //[1]
                    cb(true)
                }
            })

        }
    }
});

io.connect(function(socket){
	console.log(socket.upgradeReq.user)
});

*/