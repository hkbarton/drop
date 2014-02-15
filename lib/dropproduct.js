var path = require('path');

var Product = function(id, nodeFolder){
  var getNodePath = function(){
    var productNodePathName = '.prd_' + this.id;
    return path.join(this.nodeFolder, productNodePathName);
  };

  return {
    id: id,
    nodeFolder: nodeFolder,
    getNodePath: getNodePath
  };
};

exports.Product = Product;
