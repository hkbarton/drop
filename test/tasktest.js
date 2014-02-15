var path = require('path');

var prd = require('../lib/dropproduct'),
    task = require('../lib/droptask');

function testModelStructer(){
  var nodeFolder = path.join(__dirname,'../');
  var testProduct = new prd.Product('prd1', nodeFolder);
  var task1 = new task.Task('task1', testProduct);
  console.log(task1.getNodePath());
}

testModelStructer();
