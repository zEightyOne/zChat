var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {}; //eg {{'socket_123': 'Guest1'},{'socket_456': 'Guest2'}}
var namesUsed = []; //eg ['Guest1','Guest2']
var currentRoom = {}; //eg {{'socket_123': 'Lobby'},{'socket_456': 'Lobby'}}

exports.listen = function(server) {
	//Create an IO server
	io = socketio.listen(server);
	io.set('log level', 1);
	io.sockets.on('connection',function (socket) { //LISTENER: When there is a socket connection pass the socket to this function
		guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed); //Create a guest name and increment the # of guests
		joinRoom(socket, 'Lobby');  //Add the socket to the 'Lobby' room
		handleMessageBroadcasting(socket, nickNames); //Sets up listener for socket.on('message',...)
		handleNameChangeAttempts(socket,nickNames,namesUsed); //Sets up listener for socket.on('nameAttempt',...)
		handleRoomJoining(socket); //Sets up listener for socket.on('join',...)

		socket.on('rooms', function() { //LISTENER for 'rooms' event
			socket.emit('rooms', io.sockets.manager.rooms);  //retuns a list of rooms
		});

		handleClientDisconnection(socket, nickNames, namesUsed); //Sets up listener for socket.on('disconnect',...)

	});
};

function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
	var name = 'Guest' + guestNumber; //Name = 'Guest[guestNumber] eg. Guest1'
	nickNames[socket.id] = name; //eg. {'socket_xxx': 'Guest1'}
	socket.emit('nameResult', { //sends a 'nameResult' event and corresponding message (no ACK function)
		success: true,
		name: name
	});
	namesUsed.push(name); //push the name to the end of the array
	return guestNumber + 1; 
}

function joinRoom(socket, room) {
	socket.join(room); // Join the room
	currentRoom[socket.id] = room; //eg {'xxx': 'Lobby'}
	socket.emit('joinResult',{room: room}); //sends a 'joinResult' event
	socket.broadcast.to(room).emit('message', {
		text: nickNames[socket.id] + 'has joined ' + room + '.' //broadcast to everyone in the room that Guest1 has joined
	});

	var usersInRoom = io.sockets.clients(room); //get a list of sockets connected to the room
	if (usersInRoom.length > 1) {
		var usersInRoomSummary = 'Users currently in ' + room + ': ';
		for (var index in usersInRoom) {
			var userSocketId = usersInRoom[index].id; 
			if(userSocketId != socket.id) { //if socket id is not the user who just joined and the user name ()
				if (index > 0) {
					usersInRoomSummary += ', ';
				}
				usersInRoomSummary += nickNames[userSocketId]
			}
		}
		usersInRoomSummary += '.';
		socket.emit('message', {text: usersInRoomSummary}); //send the list of usernames in the room to the user
	}
}

function handleNameChangeAttempts(socket, nickNames, namesUsed){
	socket.on('nameAttempt',function(name) { //LISTENER: nameAttempt sent from the client - (assume name passed with connection)
		if(name.indexOf('Guest') == 0 ) { //Name begins with 'Guest'
			socket.emit('nameResult', {
				success: false,
				message: 'Names cannot begin with "Guest".' //FAIL
			});
		} else {
			if(namesUsed.indexOf(name) == -1 ) { //Name is not in the namesUsed array
				var previousName = nickNames[socket.id]; //Get the previous name based on the socket id
				var previousNameIndex = namesUsed.indexOf(previousName); //get the index of the previous name in the namesUsed Array
				namesUsed.push(name); //push the new name onto the array
				nickNames[socket.id] = name; //overwrite the previous name in the nickNames object
				delete namesUsed[previousNameIndex]; //Delete the previous name out of the array
				socket.emit('nameResult', {
					success: true,
					name: name
				});
				socket.broadcast.to(currentRoom[socket.id]).emit('message', { //Get the room the user is currently in and broadcast a message
					text: previousName + ' is now known as ' + name + '.'
				});
			} else {
				socket.emit('nameResult', {
					success: false,
					text: 'That name is already in use.'
				});
			}

		}
	});
}

function handleMessageBroadcasting(socket) {
	socket.on('message', function (message) { //LISTENER eg. message = {room: 'Lobby', text: 'Hello Ladies...'}
		socket.broadcast.to(message.room).emit('message', {text: nickNames[socket.id] + ': ' + message.text });
	});
}
function handleRoomJoining(socket) {
	socket.on('join', function(room) { //LISTENER eg. room = {newRoom: 'Bathroom'}
		socket.leave(currentRoom[socket.id]); //First take user out of current room
		joinRoom(socket,room.newRoom);
	});
}

function handleClientDisconnection(socket) {
	socket.on('disconnect', function() {
		var nameIndex = namesUsed.indexOf(nickNames[socket.io]); 
		delete namesUsed[nameIndex]; //free up the username
		delete nickNames[socket.id]; //remove socket.id to username mapping
	});
}
