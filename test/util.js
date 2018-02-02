const timers = require('timers');
const spawn = require('child_process').spawn;
const portfinder = require('portfinder');
const debug = require('debug')('jubatus-node-client:test:util');

exports.createServerProcess = function (command, config, timeoutSeconds = 10, regex = /RPC server startup/) {
  const option = { port: Number(process.env.npm_package_config_test_port || 9199) };
  return portfinder.getPortPromise(option).then(port => {
      debug(`port: ${ port }`);
      return new Promise((resolve, reject) => {
          /*jslint nomen: true */
          const args = [ '-p', port, '-f', config ],
              options = { cwd: __dirname };
          resolve([port, spawn(command, args, options) ]);
      });
  }).then(([ port, serverProcess ]) => {
    const executor = (resolve, reject) => {
        const timeout = timers.setTimeout(() => {
            serverProcess.kill();
            reject(new Error('timeout!'));
        }, timeoutSeconds * 1000);
        serverProcess.on('exit', (code, signal) => {
            debug({ code, signal });
            if (code === null) {
                reject(new Error(signal));
                timers.clearTimeout(timeout);
            }
        });
        serverProcess.stdout.on('data', data => {
            if (regex.test(data.toString())) {
                resolve([ port, serverProcess ]);
                timers.clearTimeout(timeout);
            }
        });
        if (debug.enabled) {
            serverProcess.stdout.on('data', data => {
                process.stderr.write(data);
            });
        }
    };
    return new Promise(executor);
  });
};