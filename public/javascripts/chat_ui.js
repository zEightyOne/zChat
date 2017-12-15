var numberOfCalls = 1;


function divEscapedContentElement(message) {
	return $('<div></div>').text(message); //Assume this is JQuery's way of creating a div element and inserting escaped text
}

function divSystemContentElement(message) {
	return $('<div></div>').html('<i>' + message + '</i>') //Trusted text - just take it as is
}


function processUserInput(chatApp, socket) {
	var message = vueContent.sendMessage;
	var systemMessage;

	if (message.charAt(0) == '/') {
		systemMessage = chatApp.processCommand(message);
		if (systemMessage) {
			vueContent.messages.push(systemMessage);
		}
	}	else {
		chatApp.sendMessage(vueContent.room,message);
		vueContent.messages.push(message); //Vue automatically escapes data

		$('#messages').scrollTop($('#messages').prop('scrollHeight')); //TODO: Research non-JQuery scrollTop https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop
	}
	vueContent.sendMessage = '';
}



