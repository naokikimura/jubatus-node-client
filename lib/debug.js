const util = require('util');

module.exports = function (label = '') {
  const { env: { DEBUG } } = (global.process || { env: {} });
  const enabled = (DEBUG || '').indexOf(label) > -1;
  const debug = util.debuglog(label);
  Object.defineProperty(debug, 'enabled', { get() { return enabled; } });
  return debug;
};