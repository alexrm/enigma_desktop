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


	var mainwin = gui.Window.get();
var childwin = gui.Window.open('http://vk.com', {
x: 100, y: 100, width: 200, height: 300
});