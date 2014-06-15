var assert = require('assert'),
    fs = require('fs'),
    zip = require('adm-zip');

describe('worker', function(){
  var testFolder = path.join(__dirname,'workertest');

  before(function(){
    fs.mkdirSync(testFolder);
  });

  it('should create zip file', function(){
  });
});
