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
  var deployStatus = {};

  var backupFile = function(filePath, backupFolder, cb){
    var fileName = filePath.hash();
    var backupFilePath = path.join(backupFolder, fileName);
    fs.exists(filePath, function(exists){
      if (!exists){
        cb(); // return callback without do anything
        return;
      }
      var readStream = fs.createReadStream(filePath, {
        encoding: 'utf8'
      });
      var writeStream = readStream.pipe(
        fs.createWriteStream(backupFilePath,{
          encoding: 'utf8'
      }));
      readStream.on('error', function(err){
        cb(err);
      });
      writeStream.on('error', function(err){
        cb(err);
      });
      readStream.on('end', function(){
        // save backup files index file
        var backupIndexFilePath = path.join(backupFolder, '.index');
        fs.appendFile(backupIndexFilePath, 
          fileName + '\001' + filePath + '\n',{
          }, function(err){
            // TODO normal error, write log, report error
          });
        cb(); // backup finished, continue process
      });
    });
  };

  // iteration deploy new files and backup old files
  var deployFile = function(srcPath, destPath, backupFolder, callback){
    // Iteration Source File
    fs.stat(srcPath, function(err, stats){
      if (err){
        // TODO fatal error, write log, report error
        return;
      }
      if (stats.isFile()){
        // check if old file exist
        fs.stat(destPath, function(derr, dstats){
          if ((derr && derr.code===cst.errCode.fileNotFound) || dstats.isFile()){
            // backup file
            backupFile(destPath, backupFolder, function(err){
              if (err){
                // TODO backup file fail
                return;
              }
              // replace file
              var reader = fs.createReadStream(srcPath, {
                encoding: 'utf8'
              });
              var writer = reader.pipe(fs.createWriteStream(destPath, {
                encoding: 'utf8'
              }));
              reader.on('end', function(){
                // TODO
              });
              reader.on('error', function(){
                // TODO fatal error
              });
              writer.on('error', function(){
                // TODO fatal error
              });
            });
          }else if(dstats.isDirectory()){
            destPath = path.join(destPath, path.basename(srcPath));
            deployFile(srcPath, destPath, backupFolder);
          }else{
            // TODO fatal error, dest file path must be a file or directory
          }
        });
      }else if (stats.isDirectory()){ 
        fs.stat(destPath, function(derr, dstats){
          if (dstats.isDirectory()){
            fs.readdir(srcPath, function(err, files){
              if (err){
                // TODO fatal error
                return;
              }
              var getFilesResolveCallback = function(fileName, filePath){
                return function(derr1, dstats1){
                  if (derr1){
                    deployStatus.errs.push({
                      msg:'Stat dest file ' + fileName + ' failed', 
                      oriErr:derr1
                    });
                    deployStatus.processCnt++;
                    return;
                  }
                  if (dstats1.isFile()){
                    deployFile(filePath, destPath, backupFolder);
                  }else if(dstats1.isDirectory()){
                    var newDestPath = path.join(destPath, fileName);
                    try{
                      fs.mkdirSync(newDestPath);
                    }catch(e){}
                    deployFile(filePath, newDestPath, backupFolder);
                  }
                };
              };
              for (var i=0;i<files.length;i++){
                var filePath = path.join(srcPath, files[i]);
                fs.stat(filePath, getFilesResolveCallback(files[i], filePath));
              }
            });
          }else{
            deployStatus.errs.push({msg:'Can\'t copy dir '+ srcPath +
              ' to a file ' + destPath});
            deployStatus.processCnt++;
          }
        });
      }
    });
  };

  this.execute = function(args, callback){
    //-----------args-------------
    // args[0]: source path
    // args[1]: dest path, optinal, default use value from context
    // args[2]: backup path, optinal, default use taskPath + 'bak'
    //----------------------------
    if (!args){
      throw 'error'; // TODO
    }
    // NOTE: sourcePath is relative path
    var sourcePath = args[0];
    if (!sourcePath){
      throw 'error'; // TODO
    }
    if (!util.isAbsolutePath(sourcePath)){
      var srcFolder = this.context.task.getNodeSrcFilesPath();
      sourcePath = path.join(srcFolder, sourcePath);
    }
    var destPath = args[1];
    if (!destPath){
      destPath = path.join(this.context.product.deployPath,
        sourcePath);
    }else if(!util.isAbsolutePath(destPath)){
      destPath = path.join(this.context.product.deployPath,
        destPath);
    }
    var bakFolder = args[2];
    var taskPath = this.context.task.getNodePath();
    if (!bakFolder){
      bakFolder = path.join(taskPath, 'bak');
    }else if (!util.isAbsolutePath(bakFolder)){
      bakFolder = path.join(taskPath, bakFolder);
    }
    deployStatus = {errs:[], processCnt:0};
    deployFile(sourcePath, destPath, bakFolder, callback);
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
