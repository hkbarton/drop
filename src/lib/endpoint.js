var tar = require('tar'),
    struct = require('./struct'),
    cst = require('./const'),
    subproc = require('./subproc'),
    work = require('./worker'),
    util = require('./util'),
    log = require('./log.js');

function pulse(req, res){
  // update manager node information if need
  if (req.params && req.params.manager){
    cst.manager = decodeURIComponent(req.params.manager); 
    // send the manager info to pulse process
    subproc.pulseProcess.send({
      msg: require('./pulse').message.updateManager,
      data: cst.manager
    });
  }
  // return pulse information
  struct.getProductsSign(function(err, sign){
    if (err){
      log.error(err, 'Pulse response failed.'); 
      res.send(500, util.signResponse(err));
      return;
    }
    res.send(200, util.signResponse(sign));
  });
}

function sync(req, res){
  if (req.params && req.params.prd && 
    req.params.from && req.params.to){
    work.getPackedVersionFilePaths(req.params, 
    function(err, filePaths, keys){
      // response file stream
      if (err){
        res.status(500).json(err);
        return;
      }
      var serveFileName = keys[0] + '_';
      var lastKeyParts = keys[keys.length-1].split('_');
      serveFileName += lastKeyParts[lastKeyParts.length-1];
      res.attachment(serveFileName + '.tar');
      // TODO
    });
  }
}

exports.pulse = pulse;
exports.sync = sync;
