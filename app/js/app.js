var app = function() {
	function getToken() {return localStorage.getItem('access_token')};

	return {
		token: null,
		init: function() {
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

ajax.get('pages/login.html', function(e){ document.body.innerHTML = e; });