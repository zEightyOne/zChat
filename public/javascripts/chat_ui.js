var numberOfCalls = 1;


function divEscapedContentElement(message) {
	return $('<div></div>').text(message); //Assume this is JQuery's way of creating a div element and inserting escaped text
}

function divSystemContentElement(message) {
	return $('<div></div>').html('<i>' + message + '</i>') //Trusted text - just take it as is
}

function processUserInput(chatApp, socket) {
	var message = $('#send-message').val() //non-JQuery: document.getElementById('send-message').value
	var systemMessage;

	if (message.charAt(0) == '/') {
		systemMessage = chatApp.processCommand(message);
		if (systemMessage) {
			$('#messages').append(divSystemContentElement(systemMessage));
			// 
			//non-JQuery: document.getElementById('messages').innerHTML += systemMessage
			//NEVER do it this way though if you have listeners on these elements instead:
			//
			//var content = document.createTextNode(systemMessage)
			//document.getElementById('messages').appendChild(content)
			//
		}
	}	else {
		chatApp.sendMessage($('#room').text(),message); //Broadcast message to the room
		//non-JQuery: chatApp.sendMessage(document.getElementById('send-message').textContent, message);
		$('#messages').append(divEscapedContentElement(message)); 
		//non-JQuery: var content = document.createTextNode(message); document.getElementById('messages').appendChild(content)
		$('#messages').scrollTop($('#messages').prop('scrollHeight')); //TODO: Research non-JQuery scrollTop https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop
	}
	$('#send-message').val(''); //document.getElementById('send-message').value = '';
}

var socket = io.connect();

$(document).ready(function() { //non-JQuery: document.addEventListener("DOMContentLoaded", function(event) { 
	var chatApp = new Chat(socket) 

/*

	LISTENERS

*/


	socket.on('nameResult', function(result) { //LISTENER for when the server calls emit('nameResult',result)
		var message;

		if(result.success) {
			message = 'You are now known as ' + result.name + '.'; //eg. result = {success: true, name: 'Bob'}
		} else {
			message = result.message;
		}
		$('#messages').append(divSystemContentElement(message)); //non-JQuery: var content = document.createTextNode(message); document.getElementById('messages').appendChild(content) 
	});


	socket.on('joinResult', function(result){ //LISTENER for when the server calls emit('joinResult',result)
		$('#room').text(result.room); //non-JQuery document.getElementById('room').textContent = room
		$('#messages').append(divSystemContentElement('Room changed.'));
		//non-JQuery: var content = document.createTextNode('Room changed.'); document.getElementById('messages').appendChild(content)
	});

	socket.on('message', function(message) { //LISTENER for when the server calls emit('message',message)
		var newElement = $('<div></div>').text(message.text); //TODO: why not call var newElement = divEscapedContentElement(message.text)
		$('#messages').append(newElement); //non-JQuery: document.getElementById('messages').appendChild(newElement) 
	});

	socket.on('rooms', function(rooms) { //LISTENER for when the server calls emit('rooms', rooms)
		numberOfCalls++;
		$('#room-list').empty(); //Not sure why this is being used as this is not a list
		for(var room in rooms) { //Display list of rooms
			room = room.substring(1,room.length);
			if (room != '') {
				$('#room-list').append(divEscapedContentElement(room));
			}
		}

/*

	END LISTENERS

*/

		$('#room-list div').click(function() { //EVENT HANDLER: ONCLICK
			chatApp.processCommand('/join ' + $(this).text() ); //Join room when you click on it
			$('#send-message').focus();
		});
	});

	setInterval(function() { //Reqest list of room every 1000 ms
		socket.emit('rooms');
	}, 1000); 

	$('#send-message').focus();

	$('#send-form').submit(function() { //EVENT HANDLER: ONSUBMIT
		processUserInput(chatApp, socket);
		return false;
	});
});

