var path = require('path'),
    fs = require('fs'),
    assert = require('assert'),
    rimraf = require('rimraf'),
    step = require('../lib/model/step');

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
      // note: can not use async method here, coz mocha will end process after this function call
      rimraf.sync(testFolder);
    });

    it('should copy a folder recusively', function(done){
      var DeployStep = step.StepDeployFiles;
      var deploy = new DeployStep();
      deploy.execute([testSrcFolder, testDestFolder, testBackupFolder], 
      function(errs){
        if (errs){
          throw errs;
        }
        // check if copy succeed
        var srcFileA = fs.readFileSync(
          path.join(testSrcFolder, 'folder1', 'fileA.txt'),{encoding:'utf8'});
        var destFileA = fs.readFileSync(
          path.join(testDestFolder, 'folder1', 'fileA.txt'),{encoding:'utf8'});
        assert.equal(srcFileA==destFileA, true);
        var srcFileB = fs.readFileSync(
          path.join(testSrcFolder, 'folder1', 'fileB.txt'),{encoding:'utf8'});
        var destFileB = fs.readFileSync(
          path.join(testDestFolder, 'folder1', 'fileB.txt'),{encoding:'utf8'});
        assert.equal(srcFileB==destFileB, true);
        var srcFileASub = fs.readFileSync(
          path.join(testSrcFolder, 'folder1', 'subFolder1', 'fileA.txt'),
          {encoding:'utf8'});
        var destFileASub = fs.readFileSync(
          path.join(testDestFolder, 'folder1', 'subFolder1', 'fileA.txt'),
          {encoding:'utf8'});
        assert.equal(srcFileASub==destFileASub, true);
        var srcFileC = fs.readFileSync(
          path.join(testSrcFolder, 'folder2', 'fileC.txt'),{encoding:'utf8'});
        var destFileC = fs.readFileSync(
          path.join(testDestFolder, 'folder2', 'fileC.txt'),{encoding:'utf8'});
        assert.equal(srcFileC==destFileC, true);
        var srcFile1 = fs.readFileSync(
          path.join(testSrcFolder, 'file1.txt'),{encoding:'utf8'});
        var destFile1 = fs.readFileSync(
          path.join(testDestFolder, 'file1.txt'),{encoding:'utf8'});
        assert.equal(srcFile1==destFile1, true);
        var srcFile2 = fs.readFileSync(
          path.join(testSrcFolder, 'file2.txt'),{encoding:'utf8'});
        var destFile2 = fs.readFileSync(
          path.join(testDestFolder, 'file2.txt'),{encoding:'utf8'});
        assert.equal(srcFile2==destFile2, true);
        // check if backup succeed
        var backupIndex = fs.readFileSync(
          path.join(testBackupFolder, '.index'),{encoding:'utf8'});
        var backupFiles = backupIndex.split('\n');
        for(var i in backupFiles){
          if (backupFiles[i]){
            var bfInfo = backupFiles[i].split('\001');
            var bfContent = fs.readFileSync(
              path.join(testBackupFolder, bfInfo[0]), {encoding:'utf8'});
            if(bfInfo[1].indexOf('fileA')>-1){
              assert(bfContent=='Old fileA in dest folder', true); 
            }else if (bfInfo[1].indexOf('file2')>-1){
              assert(bfContent=='old file2 in dest folder', true); 
            }
          }
        }
        done();
      });
    });
  });
});
