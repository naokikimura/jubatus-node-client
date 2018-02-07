const util = require('util');

module.exports = function (label = '') {
  const debug = util.debuglog(label);
  const enabled = debug.toString() !== (function () {}).toString();
  Object.defineProperty(debug, 'enabled', { get() { return enabled; } });
  return debug;
};