const obj = { 'obj': { 'with': ['nested', 'objs'], 'and': 'properties' } };
const array = [{ 'prop1': 'value', 'prop2': 'value' }, { 'prop1': 'value', 'prop2': 'value' }, { 'prop1': 'value', 'prop2': 'value' }];
const separator = '-'.repeat(30);

function printObjs() {
    console.log('%j', obj);
    console.dir(obj);
}

function printArrays() {
    console.table(array);
}

function printError() {
    console.error('Something failed with this object %j', obj);
}

function countLineCalledTimes() {
    console.count('counter1');
    console.count('counter2');
    console.count('counter1');
    console.count('counter1');
    console.count('counter2');
    console.log('counter1 reset');
    console.countReset('counter1');
    console.count('counter1');
}

function indentConsolePrints() {
    console.group('group1');
    console.log('Printed inside group1');
    console.group('group1.1');
    console.log('Printed inside group1.1');
    console.groupEnd();
    console.groupEnd();
    console.log('Printed outside of groups');

}

function printElapsedTime() {
    console.log('Starting timer...');
    console.time('timer1');
    console.log('Expensive calculation...');
    const expensiveVar = "Something".repeat(500000);
    console.timeLog('timer1');
    const expensiveVar2 = "Something".repeat(5000);
    console.log('End of operations');
    console.timeEnd('timer1');
}

function printTrace() {
    console.trace();
}

function clearConsole() {
    console.log('Clearing the console in 30s');
    setTimeout(() => {
        console.clear();
    }, 30000);
}

function variousUtilities() {
    countLineCalledTimes();
    console.log(separator);
    indentConsolePrints();
    console.log(separator);
    printElapsedTime();
    console.log(separator);
    printTrace();
    console.log(separator);
    clearConsole();
}

function basicDebugger() {
    /*
    Works when NODE_DEBUG is set to myapp
    */
    const util = require('util');
    const debuglog = util.debuglog('myapp');
    debuglog('debug message [%d]', 123);
}

console.log(separator);
printObjs();
console.log(separator);
printArrays();
console.log(separator);
printError();
console.log(separator);
basicDebugger();
console.log(separator);
variousUtilities();