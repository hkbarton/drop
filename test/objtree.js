var task = require('../lib/task.js'),
    step = require('../lib/step.js'),
    product = require('../lib/product.js');

var testPrd = new product('product1', '/dropnode');
var testTask = new task('taskA', testPrd);
var step1 = testTask.createStep(step.StepDeployFiles, null);
var step2 = testTask.createStep(step.StepUpdateConfig, step1);

console.log('Product: ' + testPrd.id + '  Path:' + testPrd.getNodePath());
console.log('Task: ' + testTask.id + '  Path:' + testTask.getNodePath() + ' ContextProduct:' + testTask.context.product.id);
console.log('Step1: task:' + step1.context.task.id + '  product:' + step1.context.product.id);
console.log('Step2: task:' + step2.context.task.id + '  product:' + step2.context.product.id);
step1.execute();
step2.execute();
