var path = require('path'),
    fs = require('fs');

var prd = require('../lib/product'),
    task = require('../lib/task');

function testModelStructer(){
  var nodeFolder = path.join(__dirname,'../');
  var testProduct = new prd.Product('prd1', nodeFolder);
  var task1 = new task.Task('task1', testProduct);
  console.log(task1.getNodePath());
}

function deployFileTest(){
  // create source file and folder for test
  var testFolder = path.join(__dirname,'DeployTest');
  var testSrcFolder = path.join(testFolder,'src');
  var testDestFolder = path.join(testFolder, 'dest');
  var testBackupFolder = path.join(testFolder, 'backup');
  console.log('build test source folders and files under: ' + testSrcFolder);
  try{
    fs.mkdirSync(testFolder);
    fs.mkdirSync(testSrcFolder);
    fs.mkdirSync(testDestFolder);
    fs.mkdirSync(testBackupFolder);
    fs.mkdirSync(path.join(testSrcFolder, 'folder1'));
    fs.mkdirSync(path.join(testDestFolder, 'folder1')); // backup test
    fs.mkdirSync(path.join(testSrcFolder, 'folder1', 'subfolder1'));
    fs.mkdirSync(path.join(testSrcFolder, 'folder2'));
    fs.writeFileSync(path.join(testSrcFolder, 'folder1', 'fileA.txt'),'fileA');
    fs.writeFileSync(path.join(testDestFolder, 'folder1', 'fileA.txt'),'Old fileA in dest folder');
    fs.writeFileSync(path.join(testSrcFolder, 'folder1', 'fileB.txt'),'fileB');
    fs.writeFileSync(path.join(testSrcFolder, 'folder1', 'subfolder1', 'fileA.txt'),'fileA in subfolder');
    fs.writeFileSync(path.join(testSrcFolder, 'folder2', 'fileC.txt'),'fileC');
    fs.writeFileSync(path.join(testSrcFolder, 'file1.txt'),'file1');
    fs.writeFileSync(path.join(testSrcFolder, 'file2.txt'),'file2');
    fs.writeFileSync(path.join(testDestFolder, 'file2.txt'),'old file2 in dest folder');
  }catch(e){
    console.log(e);
  }
  // deploy test
  console.log('deploy test source file to dest');
  var DeployStep = require('../lib/step').StepDeployFiles;
  var deploy = new DeployStep();
  deploy.deployFile(testSrcFolder, testDestFolder, testBackupFolder);
}

deployFileTest();
