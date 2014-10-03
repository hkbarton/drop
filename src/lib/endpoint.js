var fs = require('fs'),
    pathlib = require('path'),
    tar = require('tar-stream'),
    async = require('async'),
    fstream = require('fstream'),
    struct = require('./struct'),
    cst = require('./const'),
    subproc = require('./subproc'),
    work = require('./worker'),
    util = require('./util'),
    log = require('./log.js');

/* Response pulse request */

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

/* Response sync files request */

function getAddTarEntryFun(filePath, pack){
  return function(callback){
    var fileName = pathlib.basename(filePath);
    var err = {};
    var fileSize;
    try{
      fileSize = fs.statSync(filePath).size;
    }catch(e){
      log.error(e, 'Stat file ' + fileName + ' failed when serve it.');
      err[fileName] = e;
      callback(err, null);
      return;
    }
    var streamErrHandle = function(serr){
      log.error(serr, 'Pack file ' + fileName + ' failed when serve it.');
      err[fileName] = serr;
      callback(err, null);
    };
    var entry = pack.entry({name: fileName, size: fileSize});
    var fileReader = fstream.Reader(filePath);
    entry.on('error', streamErrHandle);
    fileReader.on('error', streamErrHandle);
    fileReader.on('ready', function(){
      fileReader.pipe(entry);
      fileReader.on('end', function(){
        entry.end();
        callback();
      });
    });
  };
}

function sync(req, res){
  if (req.params && req.params.prd && 
    req.params.from && req.params.to){
    work.getPackedVersionFilePaths(req.params, 
    function(err, filePaths, keys){
      if (err){
        res.status(500).json(err);
        return;
      }
      var serveFileName = keys[0] + '_';
      var lastKeyParts = keys[keys.length-1].split('_');
      serveFileName += lastKeyParts[lastKeyParts.length-1];
      res.attachment(serveFileName + '.tar');
      var serveTarPack = tar.pack();
      var tarFilesSeries = [];
      for (var i=0;i<filePaths.length;i++){
        tarFilesSeries.push(getAddTarEntryFun(filePaths[i], serveTarPack));
      }
      async.series(tarFilesSeries, function(pack_err){
        if (err){
          res.status(500).json(pack_err);
          return;
        }
        serveTarPack.finalize();
        serveTarPack.pipe(res);
      });
    });
  }
}

exports.pulse = pulse;
exports.sync = sync;
