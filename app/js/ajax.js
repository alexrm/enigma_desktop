var ajax = {
    _init : function(){
        var r = false;
        if (window.XMLHttpRequest){
            ajax._req = function(){ return new XMLHttpRequest(); }
            return;
        }else if (window.ActiveXObject){
            try{
                ajax._req = function(){ return new ActiveXObject('Msxml2.XMLHTTP'); };
                return;
            }catch(e){
                try{
                    ajax._req = function(){ return new ActiveXObject('Microsoft.XMLHTTP'); };
                    return;
                }catch(f){
                    
                };
            };
        };
    },
    _getreq : function(){
        if (!ajax._req) ajax._init();
        return ajax._req();
    },
    post : function(url, query, done, fail, urlonly){
        var r = ajax._getreq();
        r.onreadystatechange = function() {
          if (r.readyState == 4) {
            if (r.status >= 200 && r.status < 300) {
              if (done) done(r.responseText, r);
            } else { // e.g sleep
              if (fail) fail(r.responseText, r);
            }
          }
        };
        try{
            r.open('POST', url, true);
        }catch(e){
            return false;
        };
        if (!urlonly) {
          r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
          r.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        };
        r.send(query);
        return r;
    },

    get: function(url, done, fail) {
        var r = ajax._getreq();
        r.onreadystatechange = function() {
          if (r.readyState == 4) {
            if ((r.status >= 200 && r.status < 300) || r.status == 0) {
              if (done) done(r.responseText, r);
            } else {
              if (fail) fail(r.responseText, r);
            }
          }
        };
        try{
            r.open('GET', url, true);
        }catch(e){
            return false;
        };
        r.send();
    }
};