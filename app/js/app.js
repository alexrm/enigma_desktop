var app = function() {
	function getToken() {return localStorage.getItem('access_token')};
	function toDate(unix) {var date = new Date(unix*1000);var hours = date.getHours();var minutes = "0" + date.getMinutes();var seconds = "0" + date.getSeconds();return hours + ':' + minutes.substr(minutes.length-2) + ':' + seconds.substr(seconds.length-2);}
	return {
		user: null,
		init: function() {
			vk.token = getToken();
			var _this = this;
			this.check(function(res) {
				if (res && res.response) {
					var profile = res.response[0];
					localStorage.setItem('profile', JSON.stringify(profile));
					ajax.get('pages/main.html', function(data){ 
						document.body.innerHTML = data;
						$('#user_name').innerHTML = profile.first_name + " " + profile.last_name;
						$('#user_pic').src = profile.photo_100;
						_this.start();
					});
				} else {
					vk.auth();
				}
			});
		},
		check: function(cb) {
			vk.api('users.get', {fields:"photo_100"}, cb);
		},
		start: function() {
			vk.api('execute', {code:"var dialogs = API.messages.getDialogs({count:200}).items,i=0;var ids=[],d=[];while((i=i+1) < dialogs.length) {var obj = dialogs[i].message;if (!obj.chat_id){d.push(obj);ids.push(obj.user_id);}}return {messages:d, users:API.users.get({user_ids:ids,fields:\"photo_100\"})};"}, function(data) {
				if (data && data.response) {
					var users = {};
					data.response.users.forEach(function(obj) {
						users[obj.id] = obj;
					});
					data.response.messages.forEach(function(obj) {
						var user = users[obj.user_id];
						obj.date = toDate(obj.date);
						obj.photo = user.photo_100;
						obj.name = user.first_name + " " + user.last_name;
						$('#dialogs').innerHTML += tpl('dialog', obj);
					});
				}
			})
		}
	}
}

app.init = function() {
	var shared = new app();
	shared.init();
}

window.onload = app.init;
