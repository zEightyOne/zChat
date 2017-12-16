

var vueContent = new Vue( {
	el: '#vue-content',
	data: {
		appName: '<a href="/">Growler</a>',
		appLogo: '/img/logo.jpg',
		isThirsty: true,
		sendMessage: '',
		messages: [],
		roomList: [],
		room: '',
		chatApp: null
	},
	methods: {
		onRoomListClick: function(e) {
			vueContent.chatApp.processCommand('/join ' + e.target.textContent ); //Join room when you click on it
			vueContent.$refs.refSendMessage.focus();
		},
		onFormSubmit: function(e) {
			processUserInput();
			return false;
		},
		init: function(){
			var socket = io.connect();
			this.chatApp = new Chat(socket); 

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
				vueContent.room = result.room;
				vueContent.messages.push('Room changed to ' + result.room);		
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

			 });

			setInterval(function() { //Reqest list of room every 1000 ms
				socket.emit('rooms');
			}, 1000); 

			this.$refs.refSendMessage.focus();
		}
}, 
	mounted: function(){
			this.init();
		},
	updated: function(){ //Used for Vue instance updates - for updates at global scope use Vue.nextTick(function() {...}
		var refMessages = vueContent.$refs.refMessages;
		refMessages.scrollTop = refMessages.scrollHeight;
		}
});