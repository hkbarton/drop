var fs = require('fs'),
    path = require('path'),
    env = require('./env'),
    util = require('./util');

function pulse(req, res){
  util.getProductsSign(function(err, sign){
    if (err){
      // TODO log and report to manger node this node have some issue
      res.send(500, util.signResponse(err));
      return;
    }
    res.send(200, util.signResponse(sign));
  });
}

exports.pulse = pulse;
