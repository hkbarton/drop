var path = require('path');

var Product = function(id, nodeFolder){
  this.id = id;
  this.nodeFolder = nodeFolder;

  this.getNodePath = function(){
    var productNodePathName = this.id;
    return path.join(this.nodeFolder, productNodePathName);
  };
};

module.exports = Product;
