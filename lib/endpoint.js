var fs = require('fs'),
    path = require('path'),
    env = require('./env');

function pulse(req, res){
  fs.readdir(env.nodeDataFolder, function(err, files){
    if (err){
      // TODO log and report to manger node this node have some issue
      res.send(500, {error: String(err)});
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
            lmt: stats.mtime
          });
        }
      }
      res.send(200, result);
    }catch(ex){
      // TODO log and report to manger node this node have some issue
      res.send(500, {error: String(ex)});
    }
  });
}

exports.pulse = pulse;
