var app = function() {
	function getToken() {return localStorage.getItem('access_token')};

	return {
		user: null,
		init: function() {
			vk.token = getToken();
			this.check(function(res) {
				if (res && res.response) {
					localStorage.setItem('profile', JSON.stringify(res.response[0]));
					ajax.get('pages/main.html', function(data){ 
						document.body.innerHTML = data;

					});
				} else {
					vk.auth();
				}
			});
		},
		check: function(cb) {
			vk.api('users.get', {fields:"photo_100"}, cb);
		}
	}
}

app.init = function() {
	var shared = new app();
	shared.init();
}

window.onload = app.init;
