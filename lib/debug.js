const util = require('util');

module.exports = function (label = '') {
    const debug = util.debuglog(label);
    const tr = (object) => object && object.toString().replace(/\s/g, '');
    const equalsIgnoreSpace = (a, b) => tr(a) === tr(b);
    const isDoNothingFunction = (fn) => equalsIgnoreSpace(fn, function () { });
    const enabled = !isDoNothingFunction(debug);
    Object.defineProperty(debug, 'enabled', { get() { return enabled; } });
    return debug;
};