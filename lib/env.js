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

exports.nodeDataFolder = nodeDataFolder;
