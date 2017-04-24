var node_static = require('node-static');
var file = new node_static.Server(process.env.public);

module.exports = function(req, res){
	req.addListener('end', function(){ file.serve(req, res) }).resume();
	next();
}