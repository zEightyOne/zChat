var vueContent = new Vue( {
	el: '#vue-content',
	data: {
		appName: '<a href="/">Growler</a>',
		appLogo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_vT47OPPq_oH-ZkwtxMZ7C33WQBbK8MRFKscKyzTe48Yj3IUM',
		isThirsty: true,
		sendMessage: '',
		messages: [],
		roomList: [],
		room: ''
	}
});