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
  sync:0
};

function doWorkByMsg(workMsg){
  switch(workMsg.type){
    case _type.sync:
    sync(workMsg.data);
    break;
  }
}

/* WORK: sync product deploy task files from other node */

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

/* WORK: pack product deploy task files for serving */

var packingFileQueue = {};

function _getPackFinishCallback(key, filePath){
  return function(err){
    var packResults = packingFileQueue[key];
    if (err){ // pack file success
      log.error(err, 'Pack files fail for ' + key);
    }
    delete packingFileQueue[key];
    for (var i=0;i<packResults.length;i++){
      packResults[i].filePaths.push({
        key: key,
        path: filePath,
        err: err
      });
      _returnPackedVersionFilePaths(packResults[i]);
    }
  };
}

function _returnPackedVersionFilePaths(packResult){
  if (packResult.filePaths.length == packResult.totalCount){
    var resultPaths = [];
    var resultError = {};
    for (var i=0;i<packResult.filePaths.length;i++){
      var filePath = packResult.filePaths[i];
      if (filePath.err){
        resultError[filePath.key] = filePath.err;
      }else{
        resultPaths.push(filePath.path);
      }
    }
    if (Object.keys(resultError).length>0){
      packResult.callback(resultError, null);
    }else{
      packResult.callback(null, resultPaths.sort()); 
    }
  }
}

function getPackedVersionFilePaths(versionInfo, callback){
  if (versionInfo && versionInfo.prd && versionInfo.from && versionInfo.to){
    var versionRange = struct.getProductVersionsRange(versionInfo.prd,
      versionInfo.from, versionInfo.to);
    var totalFileCount = Object.keys(versionRange).length;
    var packResult = {
      totalCount: totalFileCount,
      filePaths:[],
      callback: callback
    };
    for(var key in versionRange){
      var filePath = path.join(struct.tempDir, key, '.tar.gz');
      if (fs.existsSync(filePath)){
        packResult.filePaths.push({key: key, path: filePath});
      }else{
        // check if files are undering packing process
        if (packingFileQueue[key] instanceof Array){ // file is packing
          packingFileQueue[key].push(packResult);
        }else{
          packingFileQueue[key] = [packResult];
          util.packFiles(taskRange[key].path, filePath, 
            _getPackFinishCallback(key, filePath));
        }
      }
    }
    _returnPackedVersionFilePaths(packResult);
  }
}

exports.type = _type;
exports.doWorkByMsg = doWorkByMsg;
exports.getPackedVersionFilePaths = getPackedVersionFilePaths;
