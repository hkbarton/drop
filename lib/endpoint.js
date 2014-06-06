var fs = require('fs'),
    path = require('path'),
    struct = require('./struct'),
    cst = require('./const'),
    subproc = require('./subproc'),
    util = require('./util');

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
      // TODO log and report to manger node this node have some issue
      res.send(500, util.signResponse(err));
      return;
    }
    res.send(200, util.signResponse(sign));
  });
}

exports.pulse = pulse;
