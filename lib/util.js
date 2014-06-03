var crypto = require('crypto'),
    env = require('./env'),
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

function getProductsSign(callback){
  fs.readdir(env.nodeDataFolder, function(err, files){
    if (err){
      callback({error:String(err)});
      return;
    }
    try{
      var result = [];
      for(var index in files){
        var file = files[index];
        var stats = fs.statSync(path.join(env.nodeDataFolder, file));
        if (stats.isDirectory()){
          result.push({
            name: file,
            lmt: stats.mtime.getTime()
          });
        }
      }
      callback(null, result);
    }catch(ex){
      callback({error:String(ex)});
    }
  });
}

// return the list of products that both input contain
// return sample: [{name: productName, result:0/-/+}]
// -: a < b, 0: a = b, +: a > b
function compareProductsSign(a, b){
  if (a && b){
    var result = [];
    for (var aindex in a){
      for (var bindex in b){
        if (a[aindex].name==b[bindex].name){
          result.push({
            name: a[aindex].name,
            result: a[aindex].lmt - b[bindex].lmt
          });
        }
      }
    }
    return result;
  }
  return null;
}

exports.signResponse = signResponse;
exports.getPrimaryIP = getPrimaryIP;
exports.increaseIP = increaseIP;
exports.decreaseIP = decreaseIP;
