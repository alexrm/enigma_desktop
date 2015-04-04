var gui = require('nw.gui');
if (process.platform === "darwin") {
  var mb = new gui.Menu({type: 'menubar'});
  mb.createMacBuiltin('RoboPaint', {
    hideEdit: false,
  });
  gui.Window.get().menu = mb;
}

var childwin = gui.Window.open('https://oauth.vk.com/authorize?client_id=3245775&scope=messages,offline&redirect_uri=http%3A%2F%2Foauth.vk.com%2Fblank.html&display=page&response_type=token', {x: 300, y: 300, width: 700, height: 500});

var $=function(e){return document.querySelector(e)},
	$$=function(e){return document.querySelectorAll(e)};
