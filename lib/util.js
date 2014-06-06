var crypto = require('crypto'),
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

function getPrimaryIP(){
  var os = require('os');
  var networks = os.networkInterfaces();
  for (var index in networks){
    var network = networks[index];
    for (var i=0;i<network.length;i++){
      var info = network[i];
      if (info.family=='IPv4' && !info.internal){
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

exports.signResponse = signResponse;
exports.getPrimaryIP = getPrimaryIP;
exports.increaseIP = increaseIP;
exports.decreaseIP = decreaseIP;
