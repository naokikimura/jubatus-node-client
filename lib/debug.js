module.exports = function (label = '', logger = console.error, thisArg = null) {
  const { env: { DEBUG } } = (global.process || { env: {} });
  const enabled = (DEBUG || '').indexOf(label) > -1;
  const debug = enabled ? (...args) => { logger.apply(thisArg, [ `${label}:` ].concat(args)); } : () => {};
  Object.defineProperty(debug, 'enabled', { get() { return enabled; } });
  return debug;
};