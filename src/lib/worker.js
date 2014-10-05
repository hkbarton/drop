var request = require('request'),
    fs = require('fs'),
    pathlib = require('path'),
    tar = require('tar-stream'),
    async = require('async'),
    cst = require('./const'),
    struct = require('./struct'),
    config = require('./config'),
    log = require('./log'),
    util = require('./util.js');

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

var syncingFilesQueue = [];

function removeFromSyncingFilesQueue(key){
  var index = syncingFilesQueue.indexOf(key);
  if (index > -1){
    syncingFilesQueue.splice(index, 1);
  }
}

function onSyncResponse(resp){
  var originalUrl = resp.request.href;
  if (resp.statusCode!=200){
    removeFromSyncingFilesQueue(originalUrl);
    var err, errData = '';
    resp.on('data', function(chunk){
      errData += chunk.toString('utf8');
    });
    resp.on('end', function(){
      try{
        err = JSON.parse(errData);
        errData = '';
      }catch(e){}
      log.error(err, 'Sync files ' + syncEndpoint + ' failed because ' + 
        String(resp.statusCode) + ' ' + errData); 
    });
    return;
  }
  var unpackStream = tar.extract();
  var unpackFinishParallel = [];
  unpackStream.on('entry', function(header, stream, callback){
    var fileName = pathlib.basename(header.name);
    var filePath = pathlib.join(struct.tempDir, fileName);
    var output = fs.createWriteStream(filePath);
    unpackFinishParallel.push(function(cb){
      output.on('finish', function(){cb(null, filePath);});
    });
    stream.pipe(output);
    var streamErrHandle = function(err){
      log.error(err, 'Sync file ' + originalUrl + 
        ' failed when unpack synced files'); 
      fs.unlink(filePath);
    };
    stream.on('error', streamErrHandle);
    outpu.on('error', streamErrHandle);
    stream.on('end', function(){callback();});
  });
  unpackStream.on('finish', function(){
    aync.parallel(unpackFinishParallel, function(err, results){
      // TODO continue unpack tar.gz file in tempDir to fileDir 
      // after unpack to fileDir, need remove task flag from syncingFilesQueue
    });
  });
}

function sync(param){
  if (param){
    // for each product need sync from other nodes
    for(var key in param){
      var syncEndpoint = 'http://' + param[key].src + ':' + config.port + 
        cst.syncUrl
        .replace(':prd', key)
        .replace(':from', param[key].selfstamp)
        .replace(':to', param[key].srcstamp);
      if (syncingFilesQueue.indexOf(syncEndpoint) > -1){
        continue;
      }
      syncingFilesQueue.push(syncEndpoint);
      // TODO need check tempDir to see if file already synced but
      // not unpack to fileDir yet
      var syncRequest = request.get(syncEndpoint);
      syncRequest.on('response', onSyncResponse);
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
    var resultKeys = [];
    var resultError = {};
    for (var i=0;i<packResult.filePaths.length;i++){
      var filePath = packResult.filePaths[i];
      if (filePath.err){
        resultError[filePath.key] = filePath.err;
      }else{
        resultPaths.push(filePath.path);
        resultKeys.push(filePath.key);
      }
    }
    if (Object.keys(resultError).length>0){
      packResult.callback(resultError, null);
    }else{
      packResult.callback(null, resultPaths.sort(), resultKeys.sort()); 
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
      var filePath = pathlib.join(struct.tempDir, key + '.tar.gz');
      if (fs.existsSync(filePath)){
        packResult.filePaths.push({key: key, path: filePath});
      }else{
        // check if files are undering packing process
        if (packingFileQueue[key] instanceof Array){ // file is packing
          packingFileQueue[key].push(packResult);
        }else{
          packingFileQueue[key] = [packResult];
          util.packFiles(versionRange[key].path, filePath, 
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
