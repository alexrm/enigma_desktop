var vk = {
	token: null,

	auth: function() {
		
	},

	api: function(method, params, cb, err) {
		var data = [];
		if (params) for (param in params) data.push(encodeURIComponent(param) + '=' + encodeURIComponent(params[param]));
		ajax.post('https://api.vk.com/method/' + method, data.join("&"), cb, err);
	}
}