var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

exports.listen = function(server) {
	//Create an IO server
	io = socketio.listen(server);
	io.set('log level', 1);
	io.sockets.on('connection',function (socket) { //When there is a socket connection pass the socket to this function
		guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed); //Create a guest name and increment the # of guests
		joinRoom(socket, 'Lobby');  //Add the socket to the 'Lobby' room
		handleMessageBroadcasting(socket, nickNames); 
		handleNameChangeAttempts(socket,nickNames,namesUsed);
		handleRoomJoining(socket);

		socket.on('rooms', function() {
			socket.emit('rooms', io.sockets.manager.rooms);

		});

		handleClientDisconnection(socket, nickNames, namesUsed);

	});
};

function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
	var name = 'Guest' + guestNumber; //Name = 'Guest[guestNumber'
	nickNames[socket.id] = name; //eg. {'xxx': 'Guest1'}
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


