var Chat = function(socket) {
	this.socket = socket;
};

/*
	Is this equivalet to the following:

	function Chat(socket) {
		this.socket = socket;
	};
*/

Chat.prototype.changeRoom = function(room) { 
	this.socket.emit('join', {
		newRoom: room
	});
};

Chat.prototype.sendMessage = function(room, text) {
	var message = {
		room: room,
		text: text
	};
	this.socket.emit('message', message);
};

Chat.prototype.processCommand = function(command) {
	var words = command.split(' '); //put the command '/join' or '/nick' in words[0]
	var command = words[0].substring(1,words[0].length).toLowerCase(); //strip the '/' off and take care of case
	var message = false;

	switch(command) {
		case 'join':
			words.shift(); //shift off 'join' words[0]
			var room = words.join(' '); //merge the rest of the array into a string (elements seperated by a ' ') - allows for multi-word rooms
			this.changeRoom(room);
			break;
		case 'nick':
			words.shift();
			var name = words.join(' '); 
			this.socket.emit('nameAttempt', name); //will cause function(name) defined in socket.on('nameAttempt', function(name)) to be called on the server
			break;
		default:
			message = {text:'Unrecognized command.',source:'System'};
			break;
	}
	return message;	
};

