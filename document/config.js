process.env = {

	"dev": false,

	"host": "localhost",
	"port": 3000,

	"app": __dirname + "/app",
	"public": __dirname + "/public",
	"socket": __dirname + "/socket",

	"mongodb": {
		"url": "localhost:27017/kem",
		"option": {}
	},
	"redis": {
		"host": "127.0.0.1",
		"port": 6379,
		"auth": "6eeb73df91baf0106f3322fb4a5440cda1b04b88",
		"option": {
			"detect_buffers": true
		},
		"table": ["login", "chat"]
	},
	"sql": {
		"host": "localhost",
		"port": 3306,
		"user": "root",
		"password": "password",
		"db": "test",
		"multiStatements": true,
		"charset": "UTF8"
	},

	"secret": new Buffer("jsonwebtoken secret key", "base64"),
	"verifySocket": true,

	"mobile": {
		"app_html": "file://" + __dirname + "/index.html",
		"device": {
			"phone": {"width": 320, "height": 568}
		}
	}
}