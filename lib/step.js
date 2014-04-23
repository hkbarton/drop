var fs = require('fs'),
    path = require('path'),
    cst = require('./const');

// drop task step, a step is actual shell command will execute when run a task
var Step = function(task, prev){
  this.context = {};
  this.context.task = task;
  this.context.product = task && task.context ? 
    task.context.product : null;
  this.prevStep = prev;

  this.execute = function(){
    console.log('Nothing to be execute.');
  };
};

// *** Deploy File Step Executor ***
var DeployFiles = function(){
  var backupFile = function(filePath, backupFolder, cb){
    var fileName = filePath.hash();
    var backupFilePath = path.join(backupFolder, fileName);
    fs.createReadStream(destPath, {
      encoding: 'utf8'
    }).pipe(fs.createWriteStream(backupFilePath,{
      encoding: 'utf8'
    })).on('end', function(){
      // save backup files index file
      var backupIndexFilePath = path.join(backupFolder, '.index');
      fs.appendFile(backupIndexFilePath, 
        fileName + '\001' + filePath,{
        }, function(err){
          // TODO normal error, write log, report error
        });
      cb(); // backup finished, continue process
    }).on('error', function(err){
      if (err.code===cst.errCode.fileNotFound){
        // backup source file not found is not a error
        console.log('file not found, continue');
        cb(); // no necessary execute backup, continue process
        return;
      }
      cb(err);
    }); 
  };

  // iteration deploy new files and backup old files
  var deployFile = function(srcPath, destPath, backupFolder){
    // Iteration Source File
    fs.stat(srcPath, function(err, stats){
      if (err){
        // TODO fatal error, write log, report error
        console.log('stat source file error: ' + err);
        return;
      }
      if (stats.isFile()){
        // check if old file exist
        fs.stat(destPath, function(derr, dstats){
          if ((derr && derr.code===cst.errCode.fileNotFound) || dstats.isFile()){
            // backup file
            backupFile(destPath, backupFolder, function(err){
              if (!err){
                // replace file
                fs.createReadStream(srcPath, {
                  encoding: 'utf8'
                }).pipe(fs.createWriteStream(destPath, {
                  encoding: 'utf8'
                }));
              }
            });
          }else if(dstats.isDirectory()){
            destPath = path.join(destPath, path.basename(srcPath));
            deployFile(srcPath, destPath);
          }else{
            console.log('stat dest file error: ' + derr);
            // TODO fatal error, dest file path must be a file or directory
          }
        });
      }else if (stats.isDirectory()){ 
        fs.stat(destPath, function(derr, dstats){
          if (dstats.isDirectory()){
            fs.readdir(srcPath, function(err, files){
              if (err){
                // TODO fatal error
                console.log('read src folder error: ' + err);
                return;
              }
              var getFilesResolveCallback = function(fileName, filePath){
                return function(derr1, dstats1){
                  if (derr1){
                    // TODO fatal error
                    console.log('stat files in folder error: ' + derr1);
                    return;
                  }
                  if (dstats1.isFile()){
                    deployFile(filePath, destPath, backupFolder);
                  }else if(dstats1.isDirectory()){
                    var newDestPath = path.join(destPath, fileName);
                    try{
                      fs.mkdirSync(newDestPath);
                    }catch(e){}
                    deployFile(filePath, newDestPath);
                  }
                };
              };
              for (var i=0;i<files.length;i++){
                var filePath = path.join(srcPath, files[i]);
                fs.stat(filePath, getFilesResolveCallback(files[i], filePath));
              }
            });
          }else{
            // TODO fatal error
            console.log('cant copy a directory to a file');
          }
        });
      }
    });
  };

  this.backupFile = backupFile;
  this.deployFile = deployFile;

  this.execute = function(args){
    if (!args){
      throw 'error'; // TODO
    }
    // NOTE: sourcePath is relative path
    var sourcePath = args[0];
    if (!sourcePath){
      throw 'error'; // TODO
    }
    sourcePath = path.join(
      this.context.task.getNodeSrcFilesPath(), sourcePath);
    var destPath = args[1];
    if (!destPath){
      destPath = path.join(this.context.product.deployPath,
        sourcePath);
    }else{
      destPath = path.join(this.context.product.deployPath,
        destPath);
    }
  };
};

// *** Update Configuration Step Executor ***
var UpdateConfig = function(){
};

// *** Run Command Step Executor ***
var RunCommand = function(){
};

exports.Step = Step;
exports.StepDeployFiles = DeployFiles;
exports.StepUpdateConfig = UpdateConfig;
exports.StepRunCommand = RunCommand;
