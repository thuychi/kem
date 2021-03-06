var fs = require('fs');
var dirname = process.env.app;

function Template(table, fulltext, column, primary) {
	fulltext = fulltext || '';
	return `var Model = require('kem/db/sql'), Check = require('kem/lib/is');

class ${table} extends Model {
	constructor(data){
		super(data);

		this.is = new Check();
		${fulltext}
	}
	${column}
};

module.exports = ${table};
`;
};

function GetSet(name, type, condition) {
	if(type){
	return `
	set ${name}(${name}){
		if(this.is.${type}(${name})${condition||''}) this.data.${name} = ${name};
	}
	get ${name}(){
		return this.data.${name};
	}
`;
	}else{
	return `
	set ${name}(${name}){
		this.data.${name} = ${name};
	}
	get ${name}(){
		return this.data.${name};
	}
`;
	}
}

module.exports = class Schema {
	constructor(table) {
		this.table = table;
		this._sql = [];
		this._model = [];
	}

	set table(name) {
		this._table = name;
	}
	get table() {
		return this._table;
	}
	set engine(name) {
		this._engine = name;
	}
	get engine() {
		return this._engine || 'InnoDB';
	}
	set sql(sql) {
		this._sql.push(sql);
	}
	get sql() {
		var sql = this._sql.join(','),
			model = Template(this.table, this._fulltext, this.model, this._primary);

		fs.writeFileSync(`${dirname + this.table}.js`, model);

		return `DROP TABLE IF EXISTS ${this.table}; CREATE TABLE ${this.table}(${sql}) ENGINE=${this.engine} DEFAULT CHARSET=utf8;`;
	}

	set model(text) {
		this._model.push(text);
	}
	get model() {
		return this._model.join('');
	}

	index(column, option) {
		if (!option) option = {};
		var name = option.name || column.join('_');
		var type = option.type ? option.type.toUpperCase() : '';

		if (type === 'FULLTEXT') {
			var b = column.join("','");
			this._fulltext = `
		// this set fulltext column
		this.fulltext = ['${b}'];
		`;
		};

		this.sql = `${type} KEY ${name}(${column})`;
	}

	increment(name, length, type) {
		length = length || 20;
		type = type || 'bigint';

		this._primary = name;

		this.model = `
	/**
	 * 	@${name}
	 * - auto_increment
	 * - Type  : 	${type}
	 * - Length: 	${length}
	 */
	${GetSet(name, 'id')}
			`;

		this.sql = `${name} ${type}(${length}) UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT`;
	}

	int(name, length, def, comment) {
		length = length || 15;
		def = def || 0;

		this.model = `
	/**
	 * 	@${name}
	 *  - Type   : 	Int
	 *  - Length : 	${length}
	 *  ${comment || ''}
	 */
	${GetSet(name, 'number')}
			`;

		this.sql = `${name} int(${length}) UNSIGNED NOT NULL DEFAULT ${def}`;
	}
	bigint(name, length, def, comment) {
		length = length || 20;
		def = def || 0;

		this.model = `
	/**
	 * 	@${name}
	 *  - Type   : 	BigInt
	 *  - Length : 	${length}
	 *  ${comment || ''}
	 */
	${GetSet(name, 'number')}
			`;

		this.sql = `${name} bigint(${length}) UNSIGNED NOT NULL DEFAULT ${def}`;
	}
	mediumint(name, length, def, comment) {
		length = length || 10;
		def = def || 0;

		this.model = `
	/**
	 * 	@${name}
	 *  - Type   : 	MediumInt
	 *  - Length : 	${length}
	 *  ${comment || ''}
	 */
	${GetSet(name, 'number')}
			`;

		this.sql = `${name} mediumint(${length}) UNSIGNED NOT NULL DEFAULT ${def}`;
	}
	smallint(name, length, def, comment) {
		length = length || 5;
		def = def || 0;

		this.model = `
	/**
	 * 	@${name}
	 *  - Type   : 	SmallInt
	 *  - Length : 	${length}
	 *  ${comment || ''}
	 */
	${GetSet(name, 'number')}
			`;

		this.sql = `${name} smallint(${length}) UNSIGNED NOT NULL DEFAULT ${def}`;
	}
	tinyint(name, length, def, comment) {
		length = length || 1;
		def = def || 0;

		this.model = `
	/**
	 * 	@${name}
	 *  - Type   : 	TinyInt
	 *  - Length : 	${length}
	 *  ${comment || ''}
	 */
	${GetSet(name, 'number')}
			`;

		this.sql = `${name} tinyint(${length}) UNSIGNED NOT NULL DEFAULT ${def}`;
	}

	char(name, length, def, comment) {
		def = def === null ? 'NULL' : def ? `"${def}"` : '""';

		this.model = `
	/**
	 * 	@${name}
	 *  - Type   : 	Char
	 *  - Length : 	${length}
	 *  ${comment || ''}
	 */
	${GetSet(name, 'string', ' && ' + name + '.length === ' + length)}
			`;

		this.sql = `${name} char(${length}) NOT NULL DEFAULT ${def}`;
	}
	varchar(name, length, def, comment) {
		def = def === null ? 'NULL' : def ? `"${def}"` : '""';

		this.model = `
	/**
	 * 	@${name}
	 *  - Type   : 	VarChar
	 *  - Length : 	${length}
	 *  ${comment || ''}
	 */
	${GetSet(name, 'string', ' && ' + name + '.length < ' + length)}
			`;

		this.sql = `${name} varchar(${length}) NOT NULL DEFAULT ${def}`;
	}

	text(name) {
		this.model = `
	/**
	 * 	@${name}
	 *  - Type   : 	Text
	 */
	${GetSet(name, 'string')}
			`;
		this.sql = `${name} text`;
	}
	longtext(name) {
		this.model = `
	/**
	 * 	@${name}
	 *  - Type   : 	LongText
	 */
	${GetSet(name, 'string')}
			`;
		this.sql = `${name} longtext`;
	}
	mediumtext(name) {
		this.model = `
	/**
	 * 	@${name}
	 *  - Type   : 	MediumText
	 */
	${GetSet(name, 'string')}
			`;
		this.sql = `${name} mediumtext`;
	}
	tinytext(name) {
		this.model = `
	/**
	 * 	@${name}
	 *  - Type   : 	TinyText
	 */
	${GetSet(name, 'string')}
			`;
		this.sql = `${name} tinytext`;
	}

	tinyblob(name) {
		this.model = `
	/**
	 * 	@${name}
	 *  - Type   : 	TinyBlob
	 */
	${GetSet(name, 'string')}
			`;
		this.sql = `${name} tinyblob`;
	}
	blob(name) {
		this.model = `
	/**
	 * 	@${name}
	 *  - Type   : 	Blob
	 */
	${GetSet(name, 'string')}
			`;
		this.sql = `${name} blob`;
	}
	mediumblob(name) {
		this.model = `
	/**
	 * 	@${name}
	 *  - Type   : 	MediumBlob
	 */
	${GetSet(name, 'string')}
			`;
		this.sql = `${name} mediumblob`;
	}
	longblob(name) {
		this.model = `
	/**
	 * 	@${name}
	 *  - Type   : 	LongBlob
	 */
	${GetSet(name, 'string')}
			`;
		this.sql = `${name} longblob`;
	}

	binary(name) {
		this.model = `
	/**
	 * 	@${name}
	 *  - Type   : 	Binary
	 */
	${GetSet(name, 'object')}
			`;
		this.sql = `${name} binary`;
	}

	date(name) {
		this.model = `
	/**
	 * 	@${name}
	 *  - Type   : 	Date
	 */
	${GetSet(name, 'date')}
			`;
		this.sql = `${name} date`;
	}
	datetime(name) {
		this.model = `
	/**
	 * 	@${name}
	 *  - Type   : 	DateTime
	 */
	${GetSet(name)}
			`;
		this.sql = `${name} datetime`;
	}
	timestamp(name, oncreate, onupdate) {
		this.model = `
	/**
	 * 	@${name}
	 *  - Type   : 	TimeStamp
	 */
	${GetSet(name)}
			`;
		this.sql = `${name} timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`;
	}

}