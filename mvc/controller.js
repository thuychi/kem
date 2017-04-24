var querystring = require('querystring'), 
	View = require('./view.js');

module.exports = class Reply {
	constructor(req, res) {
		this.body = req.body;
		this.query = req.query;
		this.bin = req.bin;
		this.cookie = req.cookie;

		this.data = { 
			status: 200,
			header: {'Content-Type': 'text/html'}
		};
		this.res = res;
	}

	status(code){
		this.data.status = code;
		return this;
	}
	message(message){
		this.data.message = message;
		return this;
	}
	header(name, value){
		switch(typeof(name)){
			case 'string':
				if(undefined === value) return this.res.getHeader(name);
				else this.data.header[name] = value;
				break;
			case 'object':
				Object.assign(this.data.header, name);
				break;
		}
		return this;
	}

	error(){
		return this.json({ error: true, message: null });
	}
	json(array){
		this.data.header['Content-Type'] = 'application/json';
		this.end(JSON.stringify(array));
	}
	html(file, data){
		this.end(View(file, data));
	}
	end(buffer){
		this.res.writeHead(this.data.status, this.data.header);
		this.res.end(buffer);
	}
}