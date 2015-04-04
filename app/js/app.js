var app = function() {
	function getToken() {return localStorage.getItem('access_token')};

	return {
		user: null,
		init: function() {
			vk.token = getToken();
			this.check(function(res) {
				if (res && res.response) {
					var profile = res.response[0];
					localStorage.setItem('profile', JSON.stringify(profile));
					ajax.get('pages/main.html', function(data){ 
						document.body.innerHTML = data;
						$('#user_name').innerHTML = profile.firstName + " " + profile.lastName;
						$('#user_pic').src = profile.photo_100;
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
