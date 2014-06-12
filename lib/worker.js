var http = require('client-http'),
    cst = require('./const'),
    config = require('./config');

var _message = {
  sync:0 
};

var workQueue = [];
var busyFlag = false;

process.on('message', function(m){
  if (m && m.msg){
    workQueue.push(m);
  }
});

function sync(param){
  if (param){
    var handleSync = function(data, err){
    };
    for(var key in param){
      var syncEndpoint = 'http://' + param[key].src + ':' + config.port + 
        cst.syncUrl
        .replace(':prd', key)
        .replace(':from', param[key].selfstamp)
        .replace(':to', param[key].srcstamp);
      http.get(syncEndpoint, handleSync); // TODO
    }
  }
}

function main(){
  if (busyFlag){
    return;
  }
  busyFlag = true;
  while(workQueue.length>0){
    var workMsg = workQueue.pop();
    switch(workMsg.msg){
      case _message.sync:
      sync(_message.data);
      break;
    }
  }
  busyFlag = false;
}

main();
setInterval(main, 2000);
exports.message = _message;
