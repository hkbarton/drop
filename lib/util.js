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
      data: oriData
    };
  }
  return oriData;
}

exports.signResponse = signResponse;
