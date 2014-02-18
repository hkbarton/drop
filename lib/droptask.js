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
  // Iteration Source File
  fs.stat(sourcePath, function(err, stats){
  });
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
