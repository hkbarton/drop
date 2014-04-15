var path = require('path');

var Product = function(id, nodeFolder){
  this.id = id;
  this.nodeFolder = nodeFolder;

  this.getNodePath = function(){
    var productNodePathName = '.prd_' + this.id;
    return path.join(this.nodeFolder, productNodePathName);
  };
};

exports.Product = Product;
