var fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
    fstream = require('fstream'),
    tar = require('tar'),
    zlib = require('zlib'),
    cst = require('./const');

String.prototype.hash = function(){
  var sha1 = crypto.createHash('sha1');
  sha1.update(this.toString(), 'utf8');
  return sha1.digest('base64').replace(/\//g, '0').replace(/\=/g, '1').replace(/\+/g, '2');
};

function signResponse(oriData){
  if (oriData){
    return {
      sign: cst.dropSignature,
      manager: cst.manager,
      data: oriData
    };
  }
  return oriData;
}

function isPrivateIP(ip){
  var ips = splitIP(ip);
  if (ips[0]==10 || 
     (ips[0]==172 && ips[1]>=16 && ips[1]<32) ||
     (ips[0]==192 && ips[1]==168)
  ){
    return true;
  }
  return false;
}

function getInternalIPv4s(){
  var result = [];
  var os = require('os');
  var networks = os.networkInterfaces();
  for (var index in networks){
    var network = networks[index];
    for (var i=0;i<network.length;i++){
      var info = network[i];
      if (info.family=='IPv4' && !info.internal){
        result.push(info.address);
      }
    }
  }
  return result;
}

function splitIP(ip){
  var ipGroup = ip.split('.');
  var result = [];
  for (var i=0;i<ipGroup.length;i++){
    result.push(parseInt(ipGroup[i]));
  }
  return result;
}

function increaseIP(ip){
  if (ip){
    var ips = splitIP(ip);
    ips[3]++;
    if (ips[3]>255){
      ips[3] = 0;
      ips[2]++;
      if (ips[2]>255){
        ips[2] = 0;
        ips[1]++;
        if (ips[1]>255){
          ips[1] = 0;
          ips[0]++;
          if (ips[0]>255){
            return ip;
          }
        }
      }
    }
    return ips[0] + '.' + ips[1] + '.' + ips[2] + '.' + ips[3];
  }
  return ip;
}

function decreaseIP(ip){
  if (ip){
    var ips = splitIP(ip);
    ips[3]--;
    if(ips[3]<0){
      ips[3] = 255;
      ips[2]--;
      if (ips[2]<0){
        ips[2] = 255;
        ips[1]--;
        if (ips[1]<0){
          ips[1] = 255;
          ips[0]--;
          if (ips[0]<0){
            return ip;
          }
        }
      }
    }
    return ips[0] + '.' + ips[1] + '.' + ips[2] + '.' + ips[3];
  }
  return ip;
}

function isAbsolutePath(p){
  if (p){
    if (process.platform==='win32'){
      if (p.indexOf(':')===1){
        return true;
      }
    }else{
      if (p.indexOf('/')===0){
        return true;
      }
    }
  }
  return false;
}

function _getFilesCount(p){
  if (p){
    var dirInfo = fs.readdirSync(p);
    var result = dirInfo.length;
    for(var i in dirInfo){
      var newPath = path.join(p, dirInfo[i]);
      var newPathStat = fs.statSync(newPath);
      if (newPathStat.isDirectory()){
        result--;
        result += _getFilesCount(newPath);
      }
    }
    return result;
  }
  return 0;
}

function getFilesCount(p){
  return _getFilesCount(p);
}

// package all files under [srcPath], output tar.gz file to destFile
function packFiles(srcPath, destFile, callback){
  var errorHandle = function(err){
    callback(err);
  };
  var reader = fstream.Reader({path: srcPath});
  reader.on('error', errorHandle);
  reader.on('ready', function(){
    var tarWritter = tar.Pack();
    var zipMid = zlib.createGzip();
    var destWriter = fstream.Writer({path:destFile,mode:0755});
    tarWritter.on('error', errorHandle);
    zipMid.on('error', errorHandle);
    destWriter.on('error', errorHandle);
    reader.pipe(tarWritter).pipe(zipMid).pipe(destWriter);
    destWriter.on('close', function(){
      callback();
    });
  });
}

// unpackage tar.gz file to a dest path
function unpackFiles(gzPath, destPath, callback){
  var errorHandle = function(err){
    callback(err);
  };
  var reader = fs.createReadStream(gzPath);
  reader.on('error', errorHandle);
  var unzip = zlib.createGunzip();
  var extractor = tar.Extract({path:destPath});
  unzip.on('error', errorHandle);
  extractor.on('error', errorHandle);
  reader.pipe(unzip).pipe(extractor);
  extractor.on('end', function(){
    callback();
  });
}

// Async task group used for execute a set of async function and run a unified
// callback when all of these function are finish to execute
function AsyncTaskGroup(allDoneCallback){
  if (typeof allDoneCallback=='function'){
    this.allDoneCallback = allDoneCallback;
  }
  this.isBusy = false;
  this.tasks = [];
  this.finishTaskCnt = 0;
}

AsyncTaskGroup.prototype.push = function(fun){
  if (typeof fun!='function'){
    throw new Error('AsyncTaskGroup only accept function as task.');
  }
  if (this.isBusy){
    return;
  }
  var task = {};
  task.fun = fun;
  task.params = [];
  var params = Object.keys(arguments);
  if (params.length>1){
    for (var i=1;i<params.length;i++){
      task.params.push(arguments[params[i]]);
    }
  }
  // last parameter is a callback function called when one task done
  // so each function passed in this method should have a callback 
  // function parameter as it's last parameter
  task.params.push(function(){
    this.finishTaskCnt++;
    if (this.finishTaskCnt==this.tasks.length){
      // clear
      this.tasks = [];  
      this.finishTaskCnt = 0;
      this.isBusy = false;
      // execute allDoneCallback
      if (typeof this.allDoneCallback=='function'){
        this.allDoneCallback();
      }
    }
  }.bind(this));
  this.tasks.push(task);
};

AsyncTaskGroup.prototype.executeAll = function(){
  if (this.isBusy){
    return;
  }
  if (this.tasks.length>0){
    this.isBusy = true;
    var len = this.tasks.length;
    var task;
    for (var i=0;i<len;i++){
      task = this.tasks[i];
      task.fun.apply(this, task.params);
    }
  }
};

exports.signResponse = signResponse;
exports.isPrivateIP = isPrivateIP;
exports.getInternalIPv4s = getInternalIPv4s;
exports.increaseIP = increaseIP;
exports.decreaseIP = decreaseIP;
exports.isAbsolutePath = isAbsolutePath;
exports.getFilesCount = getFilesCount;
exports.packFiles = packFiles;
exports.unpackFiles = unpackFiles;
exports.AsyncTaskGroup = AsyncTaskGroup;
