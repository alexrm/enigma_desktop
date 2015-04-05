var app = function() {
	function getToken() {return localStorage.getItem('access_token')};
	function toDate(unix, full) {var date = new Date(unix*1000);var hours = "0" + date.getHours();var minutes = "0" + date.getMinutes();return (full ? ("0" + date.getDate()).substr(-2) + "." + ("0" + (date.getMonth()+1)).substr(-2) + "." + ("0" + date.getYear()).substr(-2) + " " : "") + (hours.substr(hours.length-2) + ':' + minutes.substr(minutes.length-2)) }
	return {
		user: null,
		opened_chat: 0,
		secured: {},
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
			var _this = this;
			vk.api('execute', {code:"var dialogs = API.messages.getDialogs({count:200}).items,i=-1;var ids=[],d=[];while((i=i+1) < dialogs.length) {var obj = dialogs[i].message;if (!obj.chat_id){d.push(obj);ids.push(obj.user_id);}}return {messages:d, users:API.users.get({user_ids:ids,fields:\"photo_100\"})};"}, function(data) {
				if (data && data.response) {
					var users = {};
					data.response.users.forEach(function(obj) {
						users[obj.id] = obj;
					});
					$('#dialogs').innerHTML = "";
					data.response.messages.forEach(function(obj) {
						var user = users[obj.user_id];
						obj.date = toDate(obj.date);
						obj.photo = user.photo_100;
						obj.name = user.first_name + " " + user.last_name;
						
						var wrap = document.createElement('div');
							wrap.innerHTML = tpl('dialog', obj);
						var nwrap = wrap.firstChild;
						nwrap.onclick = function() {
							_this.show(obj.user_id);
						}
						$('#dialogs').appendChild(nwrap);
					});
					$('.im_history_wrap').style.display = 'none';
					$('.top_right_wrap').style.display = 'none';

					_this.long();
				}
			});
		},
		long: function() {
			var _this = this;
			vk.api('messages.getLongPollServer', {use_ssl:1}, function(res) {
				
				if (res && res.response) {
					var srv = "https://" + res.response.server + "?act=a_check&key=" + res.response.key + "&wait=25&mode=2";
					_this.reallong(srv, res.response.ts);
				}
			});
		},
		reallong: function(lnk, ts) {
			var _this = this;
			
			ajax.get(lnk + "&ts=" + ts, function(data) {
				data = JSON.parse(data);
				if (data.updates.length > 0) {
					_this.update(data.updates);
				}
				_this.reallong(lnk, data.ts);
			}, function() {
				_this.reallong(lnk, ts);
			})
		},
		update: function(data) {
			var _this = this;
			data.forEach(function(update) {
				if (update[0] == 4 && update[3] < 2000000000) {
					var id = update[3];
					var msg = update[6];
					var time = update[4];
					_this.renderMsg(id, msg, time, (update[2] & 2));
				}
			});
		},
		renderMsg: function(uid, msg, time, out) {
			if (msg.substr(0, 10) == 'ECDH_BEGIN') 
				if (out && this.secured[uid] && !this.secured[uid].secretKey) msg = tpl('service', {msg:"Waiting key ... "});
				else if (out && this.secured[uid] && this.secured[uid].secretKey) msg = tpl('service', {msg:"Key aproved!"});
				else if (!out && this.secured[uid]) {
					var key = msg.substr(10).split("<br>======================")[0];

					this.secured[uid].getPartnerKey(key);
					msg = tpl('service', {msg:"Key genered ... "});
				}else if (!out && !this.secured[uid]) {
					var key = msg.substr(10).split("<br>======================")[0];
					var ke = new VKKeyExchanging(uid);	
					ke.sendMyPublicKey();		
					ke.getPartnerKey(key);
					this.secured[uid] = ke;
					msg = tpl('service', {msg:"Key genered ... "});
				}


			var current = JSON.parse(localStorage.getItem('profile'));
			var wrap = $('#dialog_' + uid), nwrap = wrap, _this = this;
			if (wrap) {
				wrap.parentNode.removeChild(wrap);
				nwrap.querySelector('.im_dialog_message').innerHTML = msg;
				nwrap.querySelector('.im_dialog_meta').innerHTML = toDate(time);	
				nwrap.onclick = function() {
					_this.show(uid);
				}
				$('#dialogs').insertBefore(nwrap, $('#dialogs').firstChild);
			}

			vk.api('users.get', {user_id:uid, fields:"photo_100"}, function(data) {
				if (data && data.response) {
					var user = data.response[0];
					if (_this.opened_chat == uid) {
						var wrap2 = document.createElement('div'), mwrap2;
						wrap2.innerHTML = tpl('msg', {
							"photo": out ? current.photo_100 : user.photo_100,
							"name": out ? current.first_name + " " + current.last_name : user.first_name + " " + user.last_name,
							"text": msg,
							"date": toDate(time, true)
						});
						mwrap2 = wrap2.firstChild;
						$('.im_history_chat').appendChild(mwrap2);
						var topPos = $('.im_history_chat').lastChild.offsetTop;
						$('.im_history_chat_wrap').scrollTop = topPos;
					}

					if (!nwrap) {
						wrap = document.createElement('div');
						wrap.innerHTML = tpl('dialog', {
							"body": msg,
							"name": user.first_name + " " + user.last_name,
							"photo": user.photo_100,
							"date": toDate(time),
							"user_id": uid
						});
						nwrap = wrap.firstChild;
						nwrap.onclick = function() {
							_this.show(uid);
						}
						$('#dialogs').insertBefore(nwrap, $('#dialogs').firstChild);	
					}
				}
			});
		}, 
		show: function(uid) {
			if (uid === this.opened_chat) return;
			var _this = this;
			var current = JSON.parse(localStorage.getItem('profile'));
			vk.api('users.get', {user_id:uid, fields:"online,photo_100"}, function(data) {
				if (data && data.response) {
					_this.opened_chat = uid;
					if (_this.secured[_this.opened_chat] && _this.secured[_this.opened_chat].serverKey) {
						$('.locker').className = $('.locker').className.replace('locked', '') + " locked";
					} else {
						$('.locker').className = $('.locker').className.replace('locked', '');
					}
					var user = data.response[0];
					$('.top_right_wrap').style.display = 'block';
					$('.im_history_wrap').style.display = 'block';
					$('.chat_name').innerHTML = user.first_name + " " + user.last_name;
					$('.chat_members_status').innerHTML = user.online ? "online" : "offline";
					vk.api('messages.getHistory', {count:200, user_id:uid}, function(data) {
						$('.im_history_chat').innerHTML = '';
						if (data && data.response) {
							data.response.items.reverse().forEach(function(msg) {
								
								var wrap = document.createElement('div'), mwrap;
								wrap.innerHTML = tpl('msg', {
									"photo": msg.from_id == user.id ? user.photo_100 : current.photo_100,
									"name": msg.from_id == user.id ? user.first_name + " " + user.last_name : current.first_name + " " + current.last_name,
									"text": msg.body,
									"date": toDate(msg.date, true)
								});
								mwrap = wrap.firstChild;
								$('.im_history_chat').appendChild(mwrap);
							});
							var topPos = $('.im_history_chat').lastChild.offsetTop;
							$('.im_history_chat_wrap').scrollTop = topPos;
							$('.im_message_field').onkeydown = function(e) {
								if (e.keyCode == 13 && !e.shiftKey) {
									
									_this.sendMsg();
								}
							}
							$('.im_message_send_btn_wrap').onclick = _this.sendMsg;
							$('.locker').onclick = function() {
								_this.switchChat();
							};
						}
					});
				}
			});			 
		},
		sendMsg: function() {
			var msg = $('.im_message_field').innerHTML.replace('<br>', "\n").replace(/<[^<>]+>/g, '');
			$('.im_message_field').innerHTML = '';
			vk.api('messages.send', {message:msg, user_id:this.opened_chat}, function() { });
		},
		switchChat: function() {
			
			if (this.secured[this.opened_chat]) {
				this.unsecure();
			} else {
				this.secure();
			}
		}, 
		unsecure: function() {
			delete this.secured[this.opened_chat];
			$('.locker').className = $('.locker').className.replace('locked', '');
		},
		secure: function() {
			var ke = new VKKeyExchanging(this.opened_chat);	
			ke.sendMyPublicKey();		
			this.secured[this.opened_chat] = ke;
			$('.locker').className = $('.locker').className.replace('locked', '') + " locked";
		}
	}
}

app.init = function() {
	var shared = new app();
	app.shared = shared;
	shared.init();
}

window.onload = app.init;
