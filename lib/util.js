var fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
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

function getPrimaryIP(){
  var os = require('os');
  var networks = os.networkInterfaces();
  for (var index in networks){
    var network = networks[index];
    for (var i=0;i<network.length;i++){
      var info = network[i];
      if (info.family=='IPv4' && !info.internal && 
        isPrivateIP(info.address)){
        return info.address;
      }
    }
  }
  return null;
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

exports.signResponse = signResponse;
exports.isPrivateIP = isPrivateIP;
exports.getPrimaryIP = getPrimaryIP;
exports.increaseIP = increaseIP;
exports.decreaseIP = decreaseIP;
exports.isAbsolutePath = isAbsolutePath;
exports.getFilesCount = getFilesCount;
