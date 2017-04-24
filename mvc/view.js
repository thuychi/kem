var fs = require('fs'), load = require('../load.js');

function parse(html){
	var re = /\{\{(.+?)\}\}/g,
	    reExp = /(^( )?(var|if|for|else|else\sif|switch|function|return|case|break|{|}|,|;|\(|\)))(.*)?/g,
	    code = 'with(obj) { var r=[];',
	    cursor = 0,
	    match;
	var add = function (line, js) {
		js ? code += line.match(reExp) ? line : "r.push(" + line + ");" : code += line != "" ? "r.push('" + line.replace(/'/g, '"') + "');" : "";
		return add;
	};
	while (match = re.exec(html)) {
		add(html.slice(cursor, match.index))(match[1], true);
		cursor = match.index + match[0].length;
	};
	add(html.substr(cursor, html.length - cursor));
	return code + "return r.join('');}";
}

module.exports = function View(file, data){
	var array = Object.assign(data || {}, {
		use: function(_file){
			return View(_file, data)
		},
		require: function(_file){
			return require(_file)
		}
	});
	var text = fs.readFileSync(load.view(file.replace(/\./g, '/')), 'utf8').replace(/[\r\t\n]/g, '');
	return new Function('obj', parse(text)).apply(array, [array]);
}