var path = require('path'),
    fs = require('fs'),
    assert = require('assert'),
    rimraf = require('rimraf'),
    prd = require('../lib/product'),
    task = require('../lib/task');

describe('task', function(){
  describe('developy file task', function(){
    var testFolder = path.join(__dirname,'DeployTest');
    var testSrcFolder = path.join(testFolder,'src');
    var testDestFolder = path.join(testFolder, 'dest');
    var testBackupFolder = path.join(testFolder, 'backup');

    before(function(){
      // make some test folder and files here
      fs.mkdirSync(testFolder);
      fs.mkdirSync(testSrcFolder);
      fs.mkdirSync(testBackupFolder);
      fs.mkdirSync(path.join(testSrcFolder, 'folder1'));
      fs.mkdirSync(path.join(testSrcFolder, 'folder1', 'subfolder1'));
      fs.mkdirSync(path.join(testSrcFolder, 'folder2'));
      fs.writeFileSync(path.join(testSrcFolder, 'folder1', 'fileA.txt'),'fileA');
      fs.writeFileSync(path.join(testSrcFolder, 'folder1', 'fileB.txt'),'fileB');
      fs.writeFileSync(path.join(testSrcFolder, 'folder1', 'subfolder1', 'fileA.txt'),'fileA in subfolder');
      fs.writeFileSync(path.join(testSrcFolder, 'folder2', 'fileC.txt'),'fileC');
      fs.writeFileSync(path.join(testSrcFolder, 'file1.txt'),'file1');
      fs.writeFileSync(path.join(testSrcFolder, 'file2.txt'),'file2');
      fs.mkdirSync(testDestFolder);
      fs.mkdirSync(path.join(testDestFolder, 'folder1')); // backup test
      fs.writeFileSync(path.join(testDestFolder, 'folder1', 'fileA.txt'),'Old fileA in dest folder');
      fs.writeFileSync(path.join(testDestFolder, 'file2.txt'),'old file2 in dest folder');
    });

    after(function(){
      rimraf(path.join(__dirname, 'DeployTest'), function(err){if(err) throw err;});
    });

    it('should copy a folder recusively', function(){
      var DeployStep = require('../lib/step').StepDeployFiles;
      var deploy = new DeployStep();
      deploy.deployFile(testSrcFolder, testDestFolder, testBackupFolder);
      // TODO need finsih this test
    });
  });
});
