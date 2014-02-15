var fs = require('fs'),
    path = require('path');

// drop task, which execute the actual operation on deploy node
var Task = function(prd){

  return {
    context:{
      product:prd
    }
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
  var destPath = args[1];
  if (!destPath){
    destPath = path.join(this.context.product.deployPath,
      sourcePath);
  }
  // Iteration Source File

};

var UpdateConfig = Step;
UpdateConfig.prototype.execute = function(args){
};

var RunCommand = Step;
RunCommand.prototype.execute = function(args){
};

exports.StepDeployFiles = DeployFiles;
exports.StepUpdateConfig = UpdateConfig;
exports.StepRunCommand = RunCommand;
