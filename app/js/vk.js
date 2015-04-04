var vk = {
	token: null,

	auth: function() {
		ajax.get('pages/login.html', function(data){ 
			document.body.innerHTML = data; 
			$('#login_button').onclick = function() {
				VK.showAuth();
			}
		});
	},

	showAuth: function() {
		var childwin = gui.Window.open('https://oauth.vk.com/authorize?client_id=3245775&scope=messages,offline&redirect_uri=http%3A%2F%2Foauth.vk.com%2Fblank.html&display=page&response_type=token', {x: 300, y: 300, width: 700, height: 500});
		childwin.on('loaded', function() {
			console.log(this.window.location.href)
		});
	},

	api: function(method, params, cb, err) {
		var data = [];
		if (params) for (param in params) data.push(encodeURIComponent(param) + '=' + encodeURIComponent(params[param]));
		ajax.post('https://api.vk.com/method/' + method, data.join("&"), cb, err);
	}
}