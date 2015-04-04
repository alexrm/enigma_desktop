var app = function() {
	function getToken() {return localStorage.getItem('access_token')};

	return {
		token: null,
		init: function() {
			vk.showAuth();
			
			if (!(this.token = getToken()) || !this.check()) {
				vk.auth();
			} else {
				alert('it\'s work');
			}
		},
		check: function() {

		}
	}
}

app.init = function() {
	var shared = new app();
	shared.init();
}

window.onload = app.init;
