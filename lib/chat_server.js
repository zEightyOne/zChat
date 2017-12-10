var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {}; //eg {{'socket_123': 'Guest1'},{'socket_456': 'Guest2'}}
var namesUsed = []; //eg ['Guest1','Guest2']
var currentRoom = {};

exports.listen = function(server) {
	//Create an IO server
	io = socketio.listen(server);
	io.set('log level', 1);
	io.sockets.on('connection',function (socket) { //LISTENER: When there is a socket connection pass the socket to this function
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

function hendleNameChangeAttempts(socket, nickNames, namesUsed){
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
