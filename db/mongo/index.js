var ObjectId = require('mongodb').ObjectId, 
	Mongo = require('./db'), 
	Event = require('../../lib/event'),
	{ Find, FindOne, Insert, Update, Save, Remove, Aggregate, FindAndModify, CreateIndex } = require('./method');

module.exports = class MongoDB extends Event {
	constructor(data) {
		super();

		this.data = data ? Object.assign(this, data) : {};
		this.db = Mongo.get(this.constructor.name);
	}

	set id(id) {
		this.data._id = id;
	}
	get id() {
		return this.data._id;
	}
	set time(time) {
		this.data.time = time;
	}
	get time() {
		return this.data.time;
	}
	get count() {
		return Object.keys(this.data).length;
	}

	promise_error(e) {
		if(process.env.dev){
			console.log('(Line 31) MongoDB Error: ', e);
		}
	}

	find(...array) {
		return Find(this.db, array);
	}
	findOne(...array) {
		return FindOne(this.db, array);
	}

	insert() {
		if (!this.id) this.id = new ObjectId();
		Insert(this.db, this.data);
		return this.data;
	}
	save() {
		if (!this.id) this.id = new ObjectId();
		Save(this.db, this.data);
		return this.data;
	}
	update() {
		return Update(this.db, arguments);
	}
	remove(where) {
		return Remove(this.db, where);
	}

	aggregate(array) {
		return Aggregate(this.db, array);
	}

	findAndModify(object, fn) {
		return FindAndModify(this.db, object, fn);
	}
	findAndUpdate(query, update, fn) {
		return this.findAndModify({ query , update }, fn);
	}
	findAndRemove(query, fn) {
		return this.findAndModify({ query, remove: true }, fn);
	}
	findAndInsert(query, update, fn) {
		return this.findAndModify({ query, update, new: true, upsert: true }, fn);
	}
	index(){
		CreateIndex(this.db, arguments);
	}

	static table() {
		return Mongo.get(this.name);
	}

	static find(...array) {
		return Find(this.table(), array);
	}
	static findOne(...array) {
		return FindOne(this.table(), array);
	}

	static insert(data) {
		if (!data._id) data._id = new ObjectId();
		Insert(this.table(), data);
		
		return data;
	}
	static save(data) {
		if (!data._id) data._id = new ObjectId();
		Save(this.table(), data);

		return data;
	}
	static update(...array) {
		return Update(this.table(), array);
	}
	static remove(where) {
		return Remove(this.table(), where);
	}

	static aggregate(array) {
		return Aggregate(this.table(), array);
	}

	static findAndModify(object, fn) {
		return FindAndModify(this.table(), object, fn);
	}
	static findAndUpdate(query, update, fn) {
		return this.findAndModify({ query: query, update: update }, fn);
	}
	static findAndRemove(query, fn) {
		return this.findAndModify({ query: query, remove: true }, fn);
	}
	static findAndInsert(query, update, fn) {
		return this.findAndModify({ query: query, update: update, new: true, upsert: true }, fn);
	}
	static index(){
		CreateIndex(this.table(), arguments);
	}
};