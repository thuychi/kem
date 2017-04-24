var dirname = process.env.app;

module.exports = {
	model: function(name){
		return require(dirname + "/model/" + name);
	},
	controller: function(name){
		return require(dirname + "/controller/" + name);
	},
	view: function(name){
		return dirname + "/view/" + name + ".html";
	},
	lib: function(name){
		return require(dirname + "/lib/" + name);
	}
}