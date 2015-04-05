var gui = require('nw.gui');
if (process.platform === "darwin") {
  var mb = new gui.Menu({type: 'menubar'});
  mb.createMacBuiltin('RoboPaint', {
    hideEdit: false,
  });
  gui.Window.get().menu = mb;
}

var $=function(e){return document.querySelector(e)},
	$$=function(e){return document.querySelectorAll(e)};

var tpl = function(tpl, data) {
	var html = $('#template-' + tpl).innerHTML;
	for (var i in data) {
		html = html.replace('{{' + i + '}}', data[i]);
	}
	return html.trim();
}


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

var VKKeyExchanging = (function () { 
	var postfix = "\n======================\nIf you dont known WTF go to blablabla.com";

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
		vk.api('messages.send', { user_id: this.partnerId, message: 'ECDH_BEGIN'+btoa(this.serializeMyKey()) + postfix }, function(r){ 
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