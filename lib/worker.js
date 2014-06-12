var http = require('client-http'),
    cst = require('./const'),
    config = require('./config');

/* --- work message structure
{
  type, must, work type
  data, optional, data associate with this work
  sign, generate when queue work, signature of a work
  callback, callback function when finish work
}
*/

var _type = {
  sync:0 
};

var workQueue = [];
var busyFlag = false;

function queueWork(work){
  if (work && work.type){
    // sign work
    var workDataStr = work.data ? JSON.stringify(work.data) : '';
    work.sign = String(work.type) + workDataStr.hash();
    // duplicate work filter
    for (var i in workQueue){
      if (workQueue[i].sign==work.sign){
        return;
      }
    }
    // push work and do work if possible
    workQueue.push(work);
    doWork();
  }
}

function doWork(){
  if (busyFlag){
    return;
  }
  busyFlag = true;
  while(workQueue.length > 0){
    var workMsg = workQueue.pop();
    switch(workMsg.type){
      case _type.sync:
      sync(workMsg.data);
      break;
    }
  }
  busyFlag = false;
}

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

exports.type = _type;
exports.queueWork = queueWork;
