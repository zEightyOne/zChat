

var vueContent = new Vue( {
	el: '#vue-content',
	data: {
		appName: '<a href="/">Growler</a>',
		appLogo: '/img/logo.jpg',
		isThirsty: true,
		sendMessage: '',
		messages: [],
		roomList: [],
		room: ''
	},
	methods: {
		init: function(){
			var socket = io.connect();
			var chatApp = new Chat(socket); 

			//EVENT HANDLERS

			socket.on('nameResult', function(result) { //LISTENER for when the server calls emit('nameResult',result)
				var message;
				if(result.success) {
					message = 'You are now known as ' + result.name + '.'; //eg. result = {success: true, name: 'Bob'}
				} else {
					message = result.message;
				}
				vueContent.messages.push(message);
			});

			socket.on('joinResult', function(result){ //LISTENER for when the server calls emit('joinResult',result)
				$('#room').text(result.room); //non-JQuery document.getElementById('room').textContent = room
				vueContent.messages.push('Room changed.');		
			});

			socket.on('message', function(message) { //LISTENER for when the server calls emit('message',message)
				vueContent.messages.push(message.text);		
			});

			socket.on('rooms', function(rooms) { //LISTENER for when the server calls emit('rooms', rooms)
				numberOfCalls++;
				vueContent.roomList = [];
				for(var room in rooms) { //Display list of rooms
					room = room.substring(1,room.length);
					if (room != '') {
						vueContent.roomList.push(room);
					}
				}

			//END-EVENT HANDLERS

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
		}
	},	
	mounted: function(){
			this.init();
			}
	});
