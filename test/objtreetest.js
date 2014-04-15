var task = require('../lib/task.js'),
    prd = require('../lib/product.js');

var testPrd = new prd.Product('product1', '/dropnode');
var testTask = new task.Task('taskA', testPrd);
var step1 = testTask.createStep(task.StepDeployFiles, null);
var step2 = testTask.createStep(task.StepUpdateConfig, step1);

console.log('Product: ' + testPrd.id + '  Path:' + testPrd.getNodePath());
console.log('Task: ' + testTask.id + '  Path:' + testTask.getNodePath() + ' ContextProduct:' + testTask.context.product.id);
console.log('Step1: task:' + step1.context.task.id + '  product:' + step1.context.product.id);
console.log('Step2: task:' + step2.context.task.id + '  product:' + step2.context.product.id);
step1.execute();
step2.execute();
