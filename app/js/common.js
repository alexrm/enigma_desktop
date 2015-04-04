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
