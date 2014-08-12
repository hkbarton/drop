// Product and Version folder data structure management

var fs = require('fs'),
    path = require('path');

var nodeDataFolder = path.join(__dirname, '../.data'),
    selfPrdFolder = path.join(nodeDataFolder, '__self'),
    tempFolder = path.join(__dirname, '../.temp'),
    persistenceFolder = path.join(__dirname, '../.drop');

var neighborTableFile = path.join(persistenceFolder, 'neighbor');

// create root data folder of drop node
fs.exists(nodeDataFolder, function(exists){
  if (!exists){
    fs.mkdir(nodeDataFolder, function(){
      // create product folder for drop itself
      // used to update it self in future
      fs.mkdir(selfPrdFolder);
    });
  }
});
// create temp folder of drop node
// temp folder used to save the compressed file of task
// file name: [product identify]_[version stamp].zip
fs.exists(tempFolder, function(exists){
  if (!exists){
    fs.mkdir(tempFolder);
  }
});

// create persistence folder for store persistence variable
// e.g. saved neighborhoood machine information
fs.exists(persistenceFolder, function(exists){
  if (!exists){
    fs.mkdir(persistenceFolder);
  }
});

function getProductVersionStamp(name){
  var result = 0;
  if (name){
    var productPath = path.join(nodeDataFolder, name);
    try{
      var taskNames = fs.readdirSync(productPath);
      // Task Name naming specification
      // [versionTimestamp]_t_[versionName]_[initTimestamp]
      for (var index in taskNames){
        var taskVersionstamp = parseInt(taskNames[index].split('_')[0]);
        result = taskVersionstamp > result ? taskVersionstamp : result;
      }
    }catch(ex){
      // TODO log and report error
    }
  }
  return result;
}

function getProductVersionsRange(name, from, to){
  var result = {};
  if (name && from > 0 && to > 0 && to >= from){
    var productPath = path.join(nodeDataFolder, name);
    try{
      var taskNames = fs.readdirSync(productPath);
      for (var i in taskNames){
        var taskVersionstamp = parseInt(taskNames[i].split('_')[0]);
        if (taskVersionstamp > from && taskVersionstamp <= to){
          result[name + '_' + taskVersionstamp] = {
            path: path.join(productPath, taskNames[i])
          };
        }
      }
    }catch(ex){
      // TODO log and report error
    }
  }
  return result;
}

function getProductsSign(callback){
  fs.readdir(nodeDataFolder, function(err, files){
    if (err){
      callback({error:String(err)});
      return;
    }
    try{
      var result = {};
      for(var index in files){
        var file = files[index];
        result[file] = getProductVersionStamp(file);
      }
      callback(null, result);
    }catch(ex){
      callback({error:String(ex)});
    }
  });
}

// merge product sign from src to me
// if src have the same product with me, and bigger version stamp than me
function mergeProductSign(me, src){
  if (me && src){
    var result = {};
    for (var name in me){
      if (me[name] && src[name]>me[name]){
        result[name] = {
          'selfstamp': me[name],
          'srcstamp': src[name]
        };
      }
    }
    return result;
  }
  return null;
}

exports.nodeDataFolder = nodeDataFolder;
exports.tempFolder = tempFolder;
exports.persistenceFolder = persistenceFolder;
exports.neighborTableFile = neighborTableFile;
exports.getProductsSign = getProductsSign;
exports.mergeProductSign = mergeProductSign;
exports.getProductVersionsRange = getProductVersionsRange;
