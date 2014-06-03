// Product and Version folder data structure management

var fs = require('fs'),
    path = require('path');

var nodeDataFolder = path.join(__dirname, '../.data'),
    selfPrdFolder = path.join(nodeDataFolder, 'prd__self');

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

function getProductsSign(callback){
  fs.readdir(nodeDataFolder, function(err, files){
    if (err){
      callback({error:String(err)});
      return;
    }
    try{
      var result = [];
      for(var index in files){
        var file = files[index];
        result.push({
          name: file,
          versionStamp: getProductVersionStamp(file)
        });
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
            result: a[aindex].versionStamp - b[bindex].versionStamp
          });
        }
      }
    }
    return result;
  }
  return null;
}

exports.nodeDataFolder = nodeDataFolder;
exports.getProductsSign = getProductsSign;
exports.compareProductsSign = compareProductsSign;
