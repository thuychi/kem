// You must install mariadb using npm!

var Sql = require('kem/db/sql'), Check = require('kem/lib/check');

class User extends Sql {
	constructor(props) {
		super(props);
		this.fulltext = ['fname', 'lname'];
		this.is = new Check();
	}
	set id(id){
		if(this.is.id(id)) this.data.id = id;
	}
	set fname(fname){
		if(this.is.name(fname)) this.data.fname = fname;
	}
	set lname(lname){
		if(this.is.name(lname)) this.data.lname = lname;
	}
	set email(email){
		if(this.is.email(email)) this.data.email = email;
	}
	set age(age){
		if(this.is.number(age)) this.data.age = age;
	}
}

/*------------------------    SELECT    --------------------------*/

var user = new User();

// SELECT id, fname, lname FROM User 
// WHERE fname = 'Nguyen' AND lname = 'Thuan' 
// GROUP BY id
// ORDER BY id ASC 
// LIMIT 10;
user
	.select('id, fname, lname')
	.where({ fname: 'Nguyen', lname: 'Thuan' })
	.limit(10)
	.group('id')
	.sort({ id: -1 })
	.fetchAll(function(rows){
		console.log(rows)
	});

// SELECT id, fname, lname
.select(['id', 'fname', 'lname']);

// SELECT User.id, User.fname, User.lname, UserInfo.address
.select({User: ['id', 'fname', 'lname'], UserInfo: ['address']});

// WHERE id = 1
.where(1);
.where({ id: 1 });
.where('id = 1');

// WHERE (fname = 'Thuan' OR lname = 'Thuan') AND age = 20
.where({$or: { fname: 'Thuan', lname: 'Thuan' }, $and: {age: 20}});

// WHERE id in (1,2,3,4,5)
.in('id', [1,2,3,4,5]);

// WHERE id in (SELECT user_id FROM POST)
.in('id', function(){
	var post = new Post();
	return post.column('user_id').where('id < 10');
});

// SELECT EXISTS (SELECT 1 FROM User name = 'Thuy Chi' LIMIT 1)
.where({ name: 'Thuy Chi' }).isset(function(yes){});

// join with over more than 2 tables
user
	.select({ User: ['id', 'name'], UserInfo: ['address'], Post: ['*']})
	.leftJoin({ UserInfo: 'User.id = UserInfo.user_id', Post: 'Post.user_id = User.id' })
	.where({ 'User.id': 1 })
	.fetch(function(user_data){});

.leftJoin();
.rightJoin();
.innerJoin();
.join();

// exec query string
user.query('SELECT * FROM User').first(fn);
user.query('SELECT * FROM User').exec(fn);


/*----------------------      INSERT      ------------------------*/

var user = new User({
	fname: 'Thuy',
	lname: 'Chi',
	age: 27,
	email: 'thuychi@gmail.com'
});

if(user.is.error){
	console.log(user.is.getError());
}else{
	user.save(function(id){});
}

// insert for array data
user.insertArray([
	{
		fname: 'Thuy',
		lname: 'Chi',
		age: 27,
		email: 'thuychi@gmail.com'
	},
	{
		fname: 'Nguyen',
		lname: 'Thuan',
		age: 25,
		email: 'nguyenthuan@gmail.com'
	},
	{
		fname: 'Tran',
		lname: 'Thuy',
		age: 17,
		email: 'tran.thuy@gmail.com'
	}
], function(array_id){
	// 
});


/*-----------------     UPDATE      -----------------*/

// UPDATE User set age = 26 WHERE id = 2;
user.where({ id: 2 }).update({ age: 26 });


/*-----------------     DELETE 		-----------------*/

// DELETE FROM User WHERE id = 3;
user.where({ id: 3 }).remove();


/*-----------------     FULLTEXT SEARCH     ------------------*/

// SELECT * FROM User WHERE MATCH (fname, lname) AGINST ('Thuan' IN BOOLEAN MODE);
user.search('Thuan').fetchAll(function(rows){});


/*----------------- 	EXPLAIN QUERY 	  -------------------*/
user.select('id').where('id > 10').explain(function(info){});


/*-----------------		CALL FUNCTION 		--------------*/
Sql.call('function_name', ['value1', 'value2']);


// =====================================================================================

// create Schema and auto make model file

// 1. create new file /path/to/project/schema.js:

var DB = require('kem/db/sql');

DB.create('User', function(table){
	table.increment('id');
	table.varchar('fname', 100);
	table.varchar('lname', 100);
	table.varchar('email', 100);
	table.tinyint('age', 3);
	table.index(['fname', 'lname'], {name: 'name', type: 'fulltext'});
	return table;

	// ===> table[data_type]( field, length, default_value, comment );
	// ===> table.index( array_field, { name, type } );
	// type: fulltext, unique, index, primary
});

// 2. run file in command: node schema.js

// 3. See file /app/model/User.js