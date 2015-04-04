window.onload = app.init;

var app = function() {
	function getToken() {return localStorage.getItem('access_token')};

	return {
		token: null,
		init: function() {
			if (!(this.token = getToken()) || !this.check()) {
				alert('need auth');
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