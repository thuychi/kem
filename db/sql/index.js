var MariaDB = require('mariasql'), 
	Schema = require('./schema'), 
	SORT = { '-1': 'ASC', '1': 'DESC' }, 
	DB = new MariaDB(process.env.sql);

function escape(value) {
	return MariaDB.escape(value);
};

module.exports = class MySQL {
	constructor(data) {
		this.define = {table: this.constructor.name, column: '*'};
		this.data = data || {};
	}

	apply(data){
		Object.assign(this, data);
	}

	Set(key, value) {
		this.define[key] = value;
		return this;
	}
	Get(key) {
		return this.define[key];
	}

	query(sql, param) {
		this._promise = new Promise(function (resolve, reject) {
			DB.query(sql, param, function (e, rows) {
				return e == null && rows ? resolve(rows) : reject(e);
			});
		});
		return this;
	}

	table(name){
		return this.Set('table', name);
	}

	select(list_column) {
		/**
	   	 * list_column = 'a,b,c';
	     * list_column = {User: [], UserLogin: []};
	     */
		if ("object" === typeof list_column) {
			if (Array.isArray(list_column)){
				list_column = list_column.join(',');
			}else {
				var txt = [];
				for (var table in list_column) {
					txt = txt.concat(list_column[table].map(function(col){ return table + '.' + col }));
				};
				list_column = txt.join(',');
			}
		};
		return this.Set('column', list_column);
	}

	join(join_condition, type) {
		var sql = [],
		    join = this.Get('join');
		for (var table in join_condition) {
			sql.push(`${type} JOIN ${table} ON ${join_condition[table]}`);
		};
		return this.Set('join', (this.Get('join') || '') + sql.join(' '));
	}

	leftJoin(join_condition) {
		return this.join(join_condition, 'LEFT');
	}
	innerJoin(join_condition) {
		return this.join(join_condition, 'INNER');
	}
	rightJoin(join_condition) {
		return this.join(join_condition, 'RIGHT');
	}

	group(column) {
		return this.Set('group', `GROUP BY ${column}`);
	}

	sort(list) {
		var arr = [];
		for (var i in list) {
			arr.push(`${i} ${SORT[list[i]]}`);
		};
		return this.Set('sort', `ORDER BY ${arr}`);
	}

	limit(from, count) {
		var limit = [from];
		if (count) limit.push(count);
		return this.Set('limit', `LIMIT ${limit}`);
	}
	where(conditions) {
		var sql = ['WHERE'],
		    dataset = [];
		switch (typeof conditions) {
			case 'number':
				return this.Set('where', `WHERE id = ${conditions}`);
			case 'string':
				return this.Set('where', `WHERE ${conditions}`);
			case 'object':
				var where_object = function ($condition, OR, AND) {
					var where = [], v;
					if (OR && sql.length > 1) sql.push(OR);
					for (var where_condition in $condition) {
						v = $condition[where_condition];
						if ('string' === typeof v) {
							v = escape(v);
							where.push(`${where_condition} = "${v}"`);
						} else where.push(`${where_condition} = ${v}`);
					};
					var value = where.join(` ${AND} `);
					sql.push(where.length > 1 ? `(${value})` : value);
				};
				if (conditions['$and'] || conditions['$or']) {
					if (conditions['$and']) where_object(conditions['$and'], 'OR', 'AND');
					if (conditions['$or']) where_object(conditions['$or'], 'AND', 'OR');
				} else where_object(conditions, null, 'AND');
				break;
		};
		return this.Set('where', sql.join(' '));
	}
	search(condition) {
		return this.Set('where', `WHERE MATCH (${this.fulltext}) AGINST (${escape(condition)} IN BOOLEAN MODE)`);
	}
	in(key, value) {
		if ('function' === typeof value) {
			var sql = value().sqlSelect();
			return this.Set('where', `WHERE ${key} IN (${sql})`);
		} else {
			var v, values = [];
			for (var i = 0, n = value.length; i < n; i++) {
				if ('string' === typeof value[i]) {
					v = escape(value[i]);
					values.push(`"${v}"`);
				} else values.push(value[i]);
			};
			return this.Set('where', `WHERE ${key} IN (${values})`);
		}
	}

	first(fn) {
		var promise = this._promise.then(function (rows) {
			return rows[0];
		});
		return fn ? promise.then(fn) : promise;
	}
	exec(fn) {
		return fn ? this._promise.then(fn) : this._promise;
	}
	isset(fn) {
		var table = this.Get('table'), where = this.Get('where');
		this.query(`SELECT EXISTS (SELECT 1 FROM ${table} ${where} LIMIT 1) AS data`, this.Get('data'));
		var promise = this._promise.then(function (rows) {
			return '0' !== rows[0].data;
		});
		return fn ? promise.then(fn) : promise;
	}
	fetchAll(fn) {
		return this.query(this.sqlSelect(), this.Get('data')).exec(fn);
	}
	fetch(fn) {
		return this.query(this.limit(1).sqlSelect(), this.Get('data')).first(fn);
	}
	save(fn) {
		return this.Get('where') ? this.update(this.data, fn) : this.insert(this.data, fn);
	}
	update(dataset, fn) {
		var sql_text = [], data = [], params;
		for (var i in dataset) {
			sql_text.push(i + ' = ?');
			data.push(dataset[i]);
		};
		if (params = this.Get('data')) data = data.concat(params);
		this.query(this.sqlJoin(['UPDATE', this.Get('table'), 'SET', sql_text.join(','), this.Get('WHERE')]), data);
		return fn ? this._promise.then(fn) : this._promise;
	}
	insert(dataset, fn) {
		var table = this.Get('table'), value;
		var array_key = [], array_value = [];
		for (var i in dataset) {
			array_key.push(i);
			if ('string' === typeof dataset[i]) {
				value = escape(dataset[i]);
				array_value.push(`"${value}"`);
			} else {
				array_value.push(dataset[i]);
			}
		};
		this.query(`INSERT INTO ${table} (${array_key}) VALUES (${array_value})`);
		return fn ? this._promise.then(function (r) { return Number(r.info.insertId) }).then(fn) : this._promise;
	}
	insertArray(array) {
		/* array: [{fname, lname}, {fname, lname}] */
		var table = this.Get('table');
		var column = Object.keys(array[0]).join(',');
		var values = [], list_value, value;

		for (var i = 0, n = array.length; i < n; i++) {
			list_value = [];
			for (var key in array[i]) {
				switch (typeof array[i][key]) {
					case 'string':
						value = escape(array[i][key]);
						list_value.push(`"${value}"`);
						break;
					case 'object':
						value = JSON.stringify(array[i][key]);
						list_value.push(`${value}`);
						break;
					default:
						list_value.push(`${array[i][key]}`);
				}
			};
			values.push(`(${list_value})`);
		};
		this.query(`INSERT INTO ${table} (${column}) VALUES ${values}`);

		return this._promise.then(function (r) {
			var insert_id = Number(r.info.insertId);
			var found_row = Number(r.info.affectedRows);
			var list_id = [];
			for (var i = 0; i < found_row; i++) {
				list_id.push(insert_id + i);
			};
			return list_id;
		});
	}
	remove(fn) {
		var sql = null, table = this.Get('table'), dataset = this.Get('data');
		if (fn) {
			var db = fn.bind(new MySQL())();
			sql = ['DELETE', table, db.sqlSelect().replace('SELECT * ', '')];
			dataset = db.get('data');
		} else {
			sql = ['DELETE FROM', table, this.Get('where')];
		};
		if (dataset) this.query(sql.join(' '), dataset);
	}
	explain(fn) {
		this.query('EXPLAIN ' + this.sqlSelect(), this.Get('data'));
		return this._promise.then(fn);
	}
	sqlJoin(array) {
		return array.join(' ').replace(/\s+/g, ' ');
	}
	sqlSelect() {
		return this.sqlJoin(['SELECT', this.Get('column'), 'FROM', this.Get('table'), this.Get('join'), this.Get('where'), this.Get('group'), this.Get('sort'), this.Get('limit') || 'LIMIT 20']);
	}

	/**
	  * 	MySQL.create('user', function(table){
	  *			table.increment('id', 20);
	  *			table.varchar('fname', 20).fulltext('fname');
	  *			return table;
	  *		});
	  */
	static create(table, fn) {
		var schema = fn(new Schema(table));
		return this.query(schema.sql);
	}

	static query(sql, param, fn){
		DB.query(sql, param, fn);
	}
	static table(name){
		var db = new MySQL();
		return db.table(name);
	}
	static call(fn, array) {
		var field = [];
		for (var i = 0, n = array.length; i < n; i++) {
			if ('string' === typeof array[i]){
				field.push(`"${array[i]}"`);
			}else{
				field.push(array[i]);
			}
		};
		field = field.join(',');
		return this.query(`CALL ${fn} ( ${field} )`);
	}
}