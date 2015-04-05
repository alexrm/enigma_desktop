window.onload = function(){ 
	//testsss
	keys = []; 
	KE = null;
	
	VK.Login(function(){   

		poll = new VKlongPolling(function(r){
			r.updates.forEach(function(update){
				if(update[0] == 4 && update[5] === " ... "){  
						if(update[2] == 49 || update[2] == 48 || update[2] == 32 || update[2] == 33){
							if(update[6].substr(0, 10) === "ECDH_BEGIN"){
								console.log("!!!!");
								
								if(KE == null){
									KE = new VKKeyExchanging(update[3]); 
								}
								//test
								
								KE.getPartnerKey(update[6].substr(10 , update[6].lenght));	
								console.log(update[6].substr(10 , update[6].lenght))
								
								
								KE.sendMyPublicKey();							
								keys[update[3]] = KE.secretKey;
								
							}
							
							
							if(keys[update[3]] != undefined){
								try{
									console.log(  (CryptoJS.AES.decrypt(atob(update[6]), keys[update[3]])).toString(CryptoJS.enc.Utf8)  );
								}
								catch(e){}
								
							}
							
							//привет майор
							
							
							console.log(update);
							
							
						}
						
						
						 				
					 
					//user_id =  update[3]
					//msg = update[6]
					
				}
				
				
				
				
				
				
				 
			})
			
			
			
			
			
		}) 
	
	
	});
	
	
	
			
	
	
} 

function test(id){
	KE = new VKKeyExchanging(id);
	KE.sendMyPublicKey();
	
	
	
}
function sendMsg(msg, to){
	if(keys[to] != undefined){
		
		
		encryptedMsg = (CryptoJS.AES.encrypt(msg, keys[to])).toString();	 
		
		VK.apiCall('messages.send', { user_id: to, message: btoa( encryptedMsg ) }, function(r){ 
			console.log(r)
		});  
		
		
	}
}

 
var VKKeyExchanging = (function () { 
	function VKKeyExchanging(partner_id) { 
		this.dh = new ECDH();
		
		this.partnerId = partner_id;
		
		this.myRand = this.dh.pick_rand();
		this.myPublicKey = this.dh.genPublicKey(this.myRand);
		
		console.log(this.myPublicKey);
		 
		return this; 
	}
	VKKeyExchanging.prototype.serializeMyKey = function(){
		return JSON.stringify({ protocol : "ECDH", type: "secp256r1", myPublic: { X: this.myPublicKey.getX().toBigInteger().toString(),  Y: this.myPublicKey.getY().toBigInteger().toString() } });
	};
	
	 
	VKKeyExchanging.prototype.sendMyPublicKey = function(){
		VK.apiCall('messages.send', { user_id: this.partnerId, message: 'ECDH_BEGIN'+btoa(this.serializeMyKey()) }, function(r){ 
			console.log(r)
		});  		
	};
	VKKeyExchanging.prototype.getPartnerKey = function(data){
		
		data = JSON.parse(atob(data));
		
		console.log(data);
		console.log(new BigInteger(data.myPublic.X).toString());
		
		this.partnerPublic = new ECPointFp(this.dh.constants.curve,
        this.dh.constants.curve.fromBigInteger(new BigInteger(data.myPublic.X)),
		this.dh.constants.curve.fromBigInteger(new BigInteger(data.myPublic.Y)));

		KEY = this.dh.genSecretKey(this.myRand, this.partnerPublic);
		
		this.secretKey = CryptoJS.SHA256(KEY.getX().toBigInteger().toString()).toString();
		console.log('Secret key:  ' + CryptoJS.SHA256(KEY.getX().toBigInteger().toString()).toString());

		//this.sendMyPublicKey(this.partnerId); 
	};
	VKKeyExchanging.prototype.sendTestEncrition = function(){
		 
		encryptedMsg = (CryptoJS.AES.encrypt(JSON.stringify({'status' : 'ok'}), this.secretKey)).toString();	
		
		msg = btoa( JSON.stringify({ 'test' : encryptedMsg }) );
		
		
		VK.apiCall('messages.send', { user_id: this.partnerId, message: msg }, function(r){ 
			console.log(r)
		});  		
	};
	VKKeyExchanging.prototype.getTestEncrition = function(msg){
		msg = JSON.parse(atob(msg));
		decrypted  = JSON.parse( (CryptoJS.AES.decrypt(msg.test, this.secretKey)).toString(CryptoJS.enc.Utf8));
		
		if(decrypted.status = "ok"){
			console.log("ol")
		}
		
	}
	return VKKeyExchanging;
})();



var VKlongPolling = (function () { 
	function VKlongPolling(callback) { 
		instance = this;
		
		VK.apiCall('messages.getLongPollServer', {}, function(r){ 
			instance.longPollServer = r.response;  
			instance.start();
		});
		
		this.callback = callback;
		 
		return this;
	} 
	VKlongPolling.prototype.start = function(ts){ 
		this.getEvents( this.longPollServer, function(r){ 
			instance.callback(r);
			instance.start(r.ts); 
		}, ( ts ? ts : undefined )); 
	};	 	
	VKlongPolling.prototype.getEvents = function( serverInfo, callback, ts ){ 
		HttpGet('http://'+serverInfo.server+'?act=a_check&key='+serverInfo.key+'&ts='+( ts ? ts : serverInfo.ts )+'&wait=25&mode=2', callback);
	};
	
	return VKlongPolling;
})();

var ECDH = (function () { 
	function ECDH() { 
		var p = new BigInteger("FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF", 16);
		var a = new BigInteger("FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC", 16);
		var b = new BigInteger("5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604B", 16); 
		var n = new BigInteger("FFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551", 16);
		var h = BigInteger.ONE;
		var curve = new ECCurveFp(p, a, b);
		var G = curve.decodePointHex("04"
		+ "6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296"
		+ "4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5"); 
		
		this.constants = {
			curve: curve,
			G: G, 
			N: n,
			H: h			
		}
		 
		return this; 
	}
   
	ECDH.prototype.pick_rand = function(){
		var rng = new SecureRandom();
		
		var n = this.constants.N;
		var n1 = n.subtract(BigInteger.ONE);
		var r = new BigInteger(n.bitLength(), rng);
		return r.mod(n1).add(BigInteger.ONE);
	};
	ECDH.prototype.genPublicKey = function(random){
		return this.constants.G.multiply(random);
	};
	ECDH.prototype.genSecretKey = function(own_random, partner_public){
		return partner_public.multiply(own_random);
	};
	
	return ECDH;
})();




var VK = {
	Login: function(callback){ 
		VK.CheckToken(function(isValid){
			if(isValid == false){
				VK.doLogin(callback);
			}
			else{
				callback();
			}			
		}); 
	},
	doLogin: function(callback){
		vkCLientId           = '3245775',
		vkRequestedScopes    = 'messages,offline',
		vkAuthenticationUrl  = 'https://oauth.vk.com/authorize?client_id=' + vkCLientId + '&scope=' + vkRequestedScopes + '&redirect_uri=http%3A%2F%2Foauth.vk.com%2Fblank.html&display=page&response_type=token';
 
 
		chrome.tabs.create({url: vkAuthenticationUrl, selected: true}, function (tab) {  
			chrome.tabs.onUpdated.addListener(VK.TabListener(tab, callback)); 
		}); 
	},
	CheckToken: function(callback){ 
		chrome.storage.local.get("vkaccess_token", function(r){
			if(r.vkaccess_token !== undefined){ 

				VK.apiCall('users.get', {}, function(r){ 
					if( r.error !== undefined ){
						callback(false);
					}
					else{
						callback(true);
					}
				});  
			}
			else{
				callback(false);
			}
		});
	},
	apiCall: function(method, params, callback){
		chrome.storage.local.get("vkaccess_token", function(r){
			if(r.vkaccess_token !== undefined){ 
				params["access_token"] = r.vkaccess_token;
				params["v"] = "5.27";
				var paramsStr = "";
				for (var key in params) {
				    if (paramsStr != "") {
				        paramsStr += "&";
				    }
				    paramsStr += key + "=" + params[key];
				}
				
				url = "https://api.vk.com/method/"+ method +"?"+paramsStr;
				
				HttpGet(url, function(r){ 
					callback(r);
				}); 
			}  
	 	});

	},
	TabListener: function(tab, callback){
		return function(tabId, changeInfo){
			if(tabId == tab.id & changeInfo.url !== undefined && changeInfo.status === "loading"){
				if (changeInfo.url.indexOf('oauth.vk.com/blank.html') > -1) {
					vkAccessToken = getUrlParameterValue(changeInfo.url, 'access_token');
					vkUid = getUrlParameterValue(changeInfo.url, 'user_id');
					
					chrome.tabs.onUpdated.removeListener(VK.TabListener);
					
					if (vkAccessToken === undefined || vkAccessToken.length === undefined) {
						alert('Проблема при авторизации');
						return;
					} 
			        chrome.storage.local.set({'vkaccess_token': vkAccessToken, 'vkuid': vkUid}, function () {
						chrome.tabs.remove( tabId, function(r) {  
							callback();
						});
			        });
				} 
			} 
		}		
	}
	
}




function ge(el){
  return (typeof el == 'string' || typeof el == 'number') ? document.getElementById(el) : el;
}
function HttpGet(theUrl, callback){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", theUrl, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) { 
			callback(JSON.parse( xhr.responseText));
		}
	}
	xhr.send();
} 

function SendEvent(event){
	
	event.now = Now;
	socket.json.send(event);	 
}


function hash(len){
    var text = " ";

    var charset = "abcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < len; i++ )
        text += charset.charAt(Math.floor(Math.random() * charset.length));

    return text;
}
function SendEvent_old(event){
	event.now = Now;
	//console.log( JSON.stringify(event)); 
	VK.apiCall('storage.set', { key : "VK_tune_ext", value : JSON.stringify(event) } , function(r){
		if( r.error != undefined ){
			SendEvent(event);
		} 
	});  
}
function formatTime(s, m) {
    s = Math.floor( s );    
    m = Math.floor( s / 60 );
    m = m >= 10 ? m : '0' + m;    
    s = Math.floor( s % 60 );
    s = s >= 10 ? s : '0' + s;    
    return m + ':' + s;
}
function nodeToString ( node ) {
   var tmpNode = document.createElement( "div" );
   tmpNode.appendChild( node.cloneNode( true ) );
   var str = tmpNode.innerHTML;
   tmpNode = node = null; // prevent memory leaks in IE
   return str;
}
function getUrlParameterValue(url, parameterName){  
    var urlParameters  = url.substr(url.indexOf("#") + 1),
        parameterValue = "",
        index,
        temp;

    urlParameters = urlParameters.split("&");

    for (index = 0; index < urlParameters.length; index += 1) {
        temp = urlParameters[index].split("=");

        if (temp[0] === parameterName) {
            return temp[1];
        }
    }

    return parameterValue;
}  