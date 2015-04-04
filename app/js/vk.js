var vk = {
	token: null,

	auth: function() {
		ajax.get('pages/login.html', function(data){ 
			document.body.innerHTML = data; 
			$('#login_btn').onclick = function() {
				vk.showAuth();
			}
		});
	},

	showAuth: function() {
		var childwin = gui.Window.open('https://oauth.vk.com/authorize?client_id=3245775&scope=messages,offline&redirect_uri=http%3A%2F%2Foauth.vk.com%2Fblank.html&display=page&response_type=token&revoke=1', {x: 300, y: 300, width: 700, height: 500});
		childwin.on('loaded', function() {
			if(this.window.location.pathname == "/blank.html") {
				var data = this.window.location.hash.substr(1).split("&");
				var qs = {};
				for (var i in data) {
					var tmp = data[i].split("=");
					qs[decodeURIComponent(tmp[0])] = decodeURIComponent(tmp[1])
				}

				if (qs.access_token) {
					localStorage.setItem('access_token', qs.access_token);
					app.init();
				}
				this.window.close();
			}
		});
	},

	api: function(method, params, cb) {
		var data = [];
		params["access_token"] = this.token;
		if (params) for (param in params) data.push(encodeURIComponent(param) + '=' + encodeURIComponent(params[param]));
		var cbs = function(res) {
			if (res) res = JSON.parse(res);
			cb(res);
		}
		ajax.post('https://api.vk.com/method/' + method, data.join("&"), cbs, cbs);
	}
}