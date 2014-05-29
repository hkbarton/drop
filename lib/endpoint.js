var fs = require('fs'),
    path = require('path'),
    env = require('./env'),
    util = require('./util');

function pulse(req, res){
  fs.readdir(env.nodeDataFolder, function(err, files){
    if (err){
      // TODO log and report to manger node this node have some issue
      res.send(500, util.signResponse({error: String(err)}));
      return;
    }
    var result = [];
    try{
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
      res.send(200, util.signResponse(result));
    }catch(ex){
      // TODO log and report to manger node this node have some issue
      res.send(500, util.signResponse({error: String(ex)}));
    }
  });
}

exports.pulse = pulse;
