// /path/to/project/socket/chat.js

var io = require('kem/ws');

io.connect(function(socket){

	// add user
	socket.on('add-user', function(id){
		socket.add(id);
	});

	// listen event
	socket.on('chat', function(request_data, fn){

		var response_data, room, user_id, user_array;

		// send data to only current client
		fn(response_data);
		socket.emit('chat', response_data);

		// send to all clients
		io.emit('chat', response_data);

		// send to all clients in a room
		socket.in(room).emit('chat', response_data);

		// send to all other clients (not current)
		socket.to(room).emit('chat', response_data);

		// send to all clients which has user_id
		io.get(user_id).emit('chat', response_data);

		// join to room
		socket.join(room);

		// leave from room
		socket.leave(room);

		// create a new room by user_array
		io.createRoom(room, user_array);

		// get user_array in a room
		var user_array = io.userRoom(room);

		// disconnection
		socket.close();
	});

});