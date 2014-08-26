var fs = require('fs'),
    pathlib = require('path'),
    rimraf = require('rimraf'),
    struct = require('../src/lib/struct.js');

var time = (new Date()).getTime();

function getLatestVersion(){
  var reuslt = 0;
  for(var version in Object.keys(this.versions)){
    if (this.versions[version] > result){
      result = this.versions[version];
    }
  }
  return result;
}

var testPrd1 = {
  name: 'test_prd1',
  path: pathlib.join(struct.fileDir, 'test_prd1'),
  versions:{
    version1:time-3000,
    version2:time-2000,
    version3:time-1000,
    version4:time
  },
  latestVersion: getLatestVersion
};

var testPrd2 = {
  name: 'test_prd2',
  path: pathlib.join(struct.fileDir, 'test_prd2'),
  versions:{
    versiona:time-3000,
    versionb:time-5000
  },
  latestVersion: getLatestVersion
};

exports.testProducts = {
  products:[testPrd1, testPrd2],
  create: function(time){
    for(var i=0;i<this.products.length;i++){
      var prd = this.products[i];
      fs.mkdirSync(prd.path);
      for(var version in Object.keys(prd.versions)){
        fs.mkdirSync(pathlib.join(prd.path, 
          prd.versions[version] + '_' + version + '_' + time));
      }
    }
  },
  destory: function(){
    for(var i=0;i<this.products.length;i++){
      rimraf.sync(this.products[i].path);
    }
  }
};
