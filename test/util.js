var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf'),
    util = require('../src/util');

describe('util', function(){
  it('should return a hash value of string', function(){
    var a = {
      filed1: 'value1'
    };
    var b = {
      filed1: 'value1'
    };
    var ahash = JSON.stringify(a).hash();
    var bhash = JSON.stringify(b).hash();
    assert.equal(ahash.length > 0, true);
    assert.equal(bhash.length > 0, true);
    assert.equal(ahash, bhash);
  });

  it('should detect if a IP is or is not a private IP', function(){
    assert.equal(util.isPrivateIP('10.0.0.1'), true);
    assert.equal(util.isPrivateIP('11.0.0.1'), false);
    assert.equal(util.isPrivateIP('172.17.0.1'), true);
    assert.equal(util.isPrivateIP('172.32.0.1'), false);
    assert.equal(util.isPrivateIP('192.168.0.1'), true);
    assert.equal(util.isPrivateIP('192.169.0.1'), false);
  });

  it('should get primary internal IP', function(){
    var ip = util.getPrimaryIP();
    assert.equal((ip===null || ip.indexOf('192')===0 || 
      ip.indexOf('172')===0 || 
      ip.indexOf('10')===0), true);
  });

  it('should check if a path is absolute or relative', function(){
    if (process.platform==='win32'){
      assert.equal(util.isAbsolutePath('C:\\absolutepath'), true);
      assert.equal(util.isAbsolutePath('.\\test\\test'), false);
      assert.equal(util.isAbsolutePath('..\\test\\test'), false);
      assert.equal(util.isAbsolutePath('test\\test'), false);
    }else{
      assert.equal(util.isAbsolutePath('/etc/test'), true);
      assert.equal(util.isAbsolutePath('./test'), false);
      assert.equal(util.isAbsolutePath('../test'), false);
      assert.equal(util.isAbsolutePath('test/test'), false);
    }
  });

  it('should get the files count of specific path', function(){
    var testFolder = path.join(__dirname,'tempFolder');
    fs.mkdirSync(testFolder);
    var subFolder1 = path.join(testFolder, 'subFolder1');
    var subFolder2 = path.join(testFolder, 'subFolder2');
    var subsubFolder = path.join(subFolder2, 'subsubfolder');
    fs.writeFileSync(path.join(testFolder, 'fileA.txt'),'fileA');
    fs.writeFileSync(path.join(testFolder, 'fileB.txt'),'fileB');
    fs.mkdirSync(subFolder1);
    fs.writeFileSync(path.join(subFolder1, 'fileA.txt'),'fileA');
    fs.writeFileSync(path.join(subFolder1, 'fileB.txt'),'fileB');
    fs.mkdirSync(subFolder2);
    fs.writeFileSync(path.join(subFolder2, 'fileA.txt'),'fileA');
    fs.mkdirSync(subsubFolder);
    fs.writeFileSync(path.join(subsubFolder, 'fileA.txt'),'fileA');
    fs.writeFileSync(path.join(subsubFolder, 'fileB.txt'),'fileB');
    var filesCount = util.getFilesCount(testFolder);
    assert.equal(filesCount==7, true);
    rimraf.sync(testFolder);
  });

  it('should pack files into a gziped tarball, and unpack them', 
  function(done){
    //this.timeout(0);
    //// pack and unpack large file test
    //var testFolder = path.join(__dirname, 'test');
    //var destFile = path.join(__dirname, 'test.tar.gz');
    //var testUnpackFolder = path.join(__dirname, 'unpack');
    //util.packFiles(testFolder, destFile, function(err){
      //if (err) throw err;
      //util.unpackFiles(destFile, testUnpackFolder, function(err){
        //if (err) throw err;
        //done();
      //});
      //console.log('decompress begin...');
    //});
    //console.log('compress begin...');
    //return;
    var testFolder = path.join(__dirname, 'packtest');
    var destFile = path.join(__dirname, 'packtest.tar.gz');
    fs.mkdirSync(testFolder);
    var testSubFolder = path.join(testFolder, 'subfolder');
    fs.mkdirSync(testSubFolder);
    fs.writeFileSync(path.join(testFolder, 'fileA.txt'), 'fileA');
    fs.writeFileSync(path.join(testSubFolder, 'file_sub.txt'), 
      'file in subfolder');
    var testUnpackFolder = path.join(__dirname, 'unpack');
    fs.mkdirSync(testUnpackFolder);
    var deleteTestFiles = function(){
      rimraf.sync(testFolder);
      rimraf.sync(testUnpackFolder);
      rimraf.sync(destFile);
    };
    util.packFiles(testFolder, destFile, function(err){
      if (err){
        deleteTestFiles();
        throw err;
      }
      util.unpackFiles(destFile, testUnpackFolder, function(err){
        if (err){
          deleteTestFiles();
          throw err;
        }
        var srcFileA = fs.readFileSync(
          path.join(testFolder, 'fileA.txt'),{encoding:'utf8'});
        var destFileA = fs.readFileSync(
          path.join(testUnpackFolder, 'packtest', 'fileA.txt'), 
          {encoding:'utf8'});
        assert.equal(srcFileA, destFileA);
        var srcSubFile = fs.readFileSync(
          path.join(testSubFolder, 'file_sub.txt'),{encoding:'utf8'});
        var destSubFile = fs.readFileSync(
          path.join(testUnpackFolder,'packtest','subfolder','file_sub.txt'),
          {encoding:'utf8'});
        assert.equal(srcSubFile, destSubFile);
        deleteTestFiles();
        done();
      });
    });
  });
});
