var request = require('request'),
    fs = require('fs'),
    cst = require('./const'),
    struct = require('./struct'),
    config = require('./config'),
    log = require('./log');

/* --- work message structure
{
  type, request, work type
  data, optional, data associate with this work
  sign, generate when queue work, signature of a work
  callback, callback function when finish work
}
*/

var _type = {
  sync:0,
  serveTaskFile:1
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
      case _type.serveTaskFile:
      serveTaskFile(workMsg.data, workMsg.callback);
      break;
    }
  }
  busyFlag = false;
}

function sync(param){
  if (param){
    var handleSync = function(err, res, data){
      // TODO
    };
    for(var key in param){
      var syncEndpoint = 'http://' + param[key].src + ':' + config.port + 
        cst.syncUrl
        .replace(':prd', key)
        .replace(':from', param[key].selfstamp)
        .replace(':to', param[key].srcstamp);
      request.get(syncEndpoint, handleSync); // TODO
    }
  }
}

var packingFileQueue = [];
var packingFileCallbackQueue = [];

function serveTaskFile(params, callback){
  if (params && params.prd && params.from && params.to){
    var taskRange = struct.getProductVersionsRange(req.params.prd,
      req.params.from, req.params.to);
    var fileCount = Object.keys(taskRange).length;
    var serveFile = function(err, path){
      // TODO
    };
    var getPackFinishCallback = function(key){
      return function(err){
        var packIndex = packingFileQueue.indexOf(key);
        var filePath = path.join(struct.tempDir, key, '.tar.gz');
        if (err){ // pack file success
          log.error(err, 'Pack files fail when serve ' + key);
        }
        for (var i=0;i<packingFileCallbackQueue[packIndex].length;i++){
          packingFileCallbackQueue[packIndex][i](err, filePath);
        }
        packingFileQueue.splice(packIndex, 1);
        packingFileCallbackQueue.splice(packIndex, 1);
      };
    };
    for(var key in taskRange){
      var filePath = path.join(struct.tempDir, key, '.tar.gz');
      if (fs.existsSync(filePath)){
        serveFile(undefined, filePath);
      }else{
        // check if files are undering packing process
        var packIndex = packingFileQueue.indexOf(key);
        if (packIndex > -1){
          packingFileCallbackQueue[packIndex].push(serveFile); 
        }else{
          packingFileQueue.push(key);
          packingFileCallbackQueue.push([serveFile]);
          util.packFiles(taskRange[key].path, 
            filePath, packFinishCallback(key));
        }
      }
    }
  }
}

exports.type = _type;
exports.queueWork = queueWork;
