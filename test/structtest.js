var struct = require('../lib/struct'),
    path = require('path'),
    fs = require('fs');

function init(){
  var nodeDataPath = path.join(__dirname, '../.data');
  var now = new Date();
  var prd1 = path.join(nodeDataPath, 'prd1');
  fs.mkdirSync(prd1);
  fs.mkdirSync(path.join(prd1,now.getTime()+'_t_version1_' + now.getTime()));
  fs.mkdirSync(path.join(prd1,(now.getTime()-1000)+'_t_version2_' + now.getTime()));
  var prd2 = path.join(nodeDataPath, 'prd2');
  fs.mkdirSync(prd2);
  fs.mkdirSync(path.join(prd2,(now.getTime()-3000)+'_t_versiona_' + now.getTime()));
  fs.mkdirSync(path.join(prd2,(now.getTime()-5000)+'_t_versionb_' + now.getTime()));
}

function structTest(){
  struct.getProductsSign(function(err, data){
    console.log(data);
  });
}

init();
structTest();
