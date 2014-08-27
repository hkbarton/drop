var fs = require('fs'),
    pathlib = require('path'),
    rimraf = require('rimraf'),
    struct = require('../src/lib/struct.js');

var time = (new Date()).getTime();

exports.testProduct = {
  products:[{
    name: 'test_prd1',
    versions:{
      version1:time-3000,
      version2:time-2000,
      version3:time-1000,
      version4:time
    }
  },{
    name: 'test_prd2',
    versions:{
      versiona:time-3000,
      versionb:time-5000
    }
  }],
  create: function(){
    for(var i=0;i<this.products.length;i++){
      var prd = this.products[i];
      prd.path = pathlib.join(struct.fileDir, prd.name);
      fs.mkdirSync(prd.path);
      var versions = Object.keys(prd.versions);
      prd.latestVersion = 0;
      for (var j=0;j<versions.length;j++){
        var version = versions[j];
        if (prd.versions[version] > prd.latestVersion){
          prd.latestVersion = prd.versions[version];
        }
        fs.mkdirSync(pathlib.join(prd.path, 
          prd.versions[version] + '_' + version + '_' + time));
      }
    }
  },
  destory: function(){
    for(var i=0;i<this.products.length;i++){
      if (typeof this.products[i].path=='string'){
        rimraf.sync(this.products[i].path);
      }
    }
  }
};
