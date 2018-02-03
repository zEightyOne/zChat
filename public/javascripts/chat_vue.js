var vueContent = new Vue( {
	el: '#vue-content',
	mixins: [ VueFocus.mixin],
	data: {
		name: 'Mudd',
		appLogo: '/img/logo.jpg',
		sendMessage: '',
		messages: [],
		roomList: [],
		room: '',
		chatApp: null,
		focused: false,
		newUser: false
	},
	filters: {
		convertTEXT: function(value) {
			return value.toUpperCase();
		}
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
			this.status = 'Connected';
			this.chatApp = new Chat(socket); 
			this.$nextTick(() => {
				if(!localStorage.getItem('name')) {
					setUserName();
				} else 
				{
					this.chatApp.processCommand('/nick ' + localStorage.getItem('name') );
				}
			})
			//EVENT HANDLERS

			socket.on('nameResult', function(result) { //LISTENER for when the server calls emit('nameResult',result)
				var message;
				if(result.success) {
					vueContent.name = result.name;
					message = {text:'You are now known as ' + result.name + '.', source:'System'}; //eg. result = {success: true, name: 'Bob'}
				} else {
					message = {text:'Unable to change name.', source:'System'};
				}
				vueContent.messages.push(message);
			});

			socket.on('joinResult', function(result){ //LISTENER for when the server calls emit('joinResult',result)
				vueContent.room = result.room;
				vueContent.messages.push({text:'Room changed to ' + result.room, source:'System'});		
			});

			socket.on('message', function(message) { //LISTENER for when the server calls emit('message',message)
				var messageArray = message.text.split(':');
				var source = messageArray.shift();
				var content = messageArray.join(':');

				vueContent.messages.push({text:content, source:source});		
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
	watch: {
		newUser: function(after,before){
			console.log(after + ' ' + before); //This is just to play with watch
		}
	},
	mounted: function(){
			this.init();
		},
	updated: function(){ //Used for Vue instance updates - for updates at global scope use Vue.nextTick(function() {...}
		if(vueContent.focused === true) { //If the focus is not on the input field, we assume the user is reviewind and therefore doesnt want autoscrolling.
			var refMessages = vueContent.$refs.refMessages;
			var refSysMessages = vueContent.$refs.refSysMessages;

			refMessages.scrollTop = refMessages.scrollHeight;
			refSysMessages.scrollTop = refSysMessages.scrollHeight;	
		}
	}
});