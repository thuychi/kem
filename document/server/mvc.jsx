// in index.js
app.use(require('kem/use/cookie'));
app.use(require('kem/use/body'));
app.use(require('kem/use/mvc'));

// in /app/controller/index.js
module.exports = class IndexController {

	// GET: http://localhost:3000
	index(r){
		r.html('index', { name: 'Tran Thuy' });
	}

	// POST: http://localhost:3000
	post_index(r){
		r.json({ error: false, message: 'Success' });
	}

	put_index(r){}
	delete_index(r){}
}

// in /app/view/index.html
<html>
	<body>Hello {{ name }}</body>
</html>