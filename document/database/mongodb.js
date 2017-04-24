// create model file: /app/model/User.js

var Mongo = require('kem/db/mongo');

class User extends Mongo {}

/*------------ using constructor function:  ------------*/

// Insert data
var user = new User({
	fname: 'Nguyen',
	lname: 'Thuan',
	age: 25,
	location: 'Vietnam'
});

var user_data = user.insert();
var user_id = user.id;

// Find
user.find({condition}, {field}, {option}, fn); // return promise

user.findOne({condition}, {field}, fn); //	return promise

// Update
user.update({condition}, {data}); // return promise

// Delete
user.remove({condition});

// aggregate
user.aggregate([array]); // return promise

// findAndModify
user.findAndModify({object}, fn); // return promise

user.findAndUpdate({condition}, {data}, fn); 

user.findAndInsert({condition}, {data}, fn);

user.findAndRemove({condition}, fn);

user.index({field});

/*-------------   using static (As above)   -------------*/

User.find 
User.findOne 
User.insert(data);

/*-------------   working with Gridfs 	-------------*/
var file = require('kem/db/mongo/file');

// Upload
file.write(binary, content_type, function(file_id){});

// Read
file.read(file_id, function(content_type, stream){});

// delete
file.remove(file_id);