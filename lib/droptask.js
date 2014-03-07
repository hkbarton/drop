var fs = require('fs'),
    path = require('path');

// drop task, which execute the actual operation on deploy node
var Task = function(id, prd){
  var getNodePath = function(){
    var taskNodePathName = '.task_' + this.id;
    return path.join(this.context.product.getNodePath(), 
      taskNodePathName);
  };

  var getNodeSrcFilesPath = function(){
    return path.join(getNodePath(), '.src'); 
  };

  return {
    id: id,
    context:{
      product:prd
    },
    getNodePath: getNodePath
  };
};

// drop task step, a step is actual shell command will execute when run a task
var Step = function(task, next){

  return {
    context:{
      product: task.context.product,
      task: task
    },
    nextStep: next
  };
};

// -----------deploy file process begin ------------

function backupFile(filePath, backupFolder, cb){
  var fileName = path.basename(filePath);
  var backupFilePath = path.join(backupFolder, fileName); // TODO bug here, file from different folder my have same file name
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
    !cb || cb();
  }).on('error', function(err){
    if (err.code=='ENOENT'){
      // ENOENT is not a error
      !cb || cb();
      return;
    }
    cb(err);
  }); 
}

// iteration deploy new files and backup old files
function deployFile(srcPath, destPath, backupFolder){
  // Iteration Source File
  fs.stat(srcPath, function(err, stats){
    if (err){
      // TODO fatal error, write log, report error
      return;
    }
    if (stats.isFile()){
      // check if old file exist
      fs.stat(destPath, function(derr, dstats){
        if ((derr && derr.code==='ENOENT') || dstats.isFile()){
          var destFileName = path.basename(destPath);
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
            var getFilesResolveCallback = function(fileName){
              return function(derr1, dstats1){
                var filePath = path.join(srcPath, fileName);
                if (derr1){
                  // TODO fatal error
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
              fs.stat(filePath, getFilesResolveCallback(files[i]));
            }
          });
        }else{
          // TODO fatal error
        }
      });
    }else{
      // TODO fatal error
    }
  });
}

var DeployFiles = Step;
DeployFiles.prototype.execute = function(args){
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

var UpdateConfig = Step;
UpdateConfig.prototype.execute = function(args){
};

var RunCommand = Step;
RunCommand.prototype.execute = function(args){
};

exports.Task = Task;
exports.StepDeployFiles = DeployFiles;
exports.StepUpdateConfig = UpdateConfig;
exports.StepRunCommand = RunCommand;
