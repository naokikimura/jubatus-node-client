/*jslint node: true, passfail: false */

const expect = require('chai').expect;
const spawn = require('child_process').spawn;
const portfinder = require('portfinder');
const debug = require('debug')('jubatus-node-client:test:regression');
const jubatus = require('../index.js');

let server;
let client;

before(done => {
    const option = { port: Number(process.env.npm_package_config_test_port || 9199) };
    portfinder.getPortPromise(option).then(port => {
        debug(`port: ${ port }`);
        const executor = (resolve, reject) => {
            /*jslint nomen: true */
            const config = 'regression_config.json',
                command = 'jubaregression',
                args = ['-p', port, '-f', config],
                options = { cwd: __dirname };
            server = spawn(command, args, options);
            server.on('exit', (code, signal) => {
                debug({ code: code, signal: signal });
                if (code === null) {
                    reject(new Error(signal));
                }
            });
            server.stdout.on('data', data => {
                if (/RPC server startup/.test(data.toString())) {
                    resolve(port);
                }
            });
            if (debug.enabled) {
                server.stdout.on('data', data => {
                    process.stderr.write(data);
                });
            }
        };
        return new Promise(executor);
    }).then(port => {
        client = new jubatus.regression.client.Regression(port, 'localhost');
        done();
    }).catch(done);
});

after(done => {
    client.getClient().close();
    server.kill();
    done();
});

describe('regression#train', () => {
    it('train', done => {
        const datum = [ [ ["foo", "bar"] ], [] ],
            value = 1.01,
            data = [ [value, datum] ];
        client.train(data).then(([ result ]) => {
            debug(result);
            expect(result).to.be.ok;
            expect(result).to.equal(1);
            done();
        }).catch(done);
    });
});

describe('regression#estimate', () => {
    it('estimate', done => {
        var datum = [ [ ["foo", "bar"] ], [] ],
            data = [ datum ];
        client.estimate(data).then(([ result ]) => {
            debug(result);
            expect(result.length).to.equal(1);

            var datum = [ [ ["foo", "bar"] ], [] ],
                value = 1,
                data = [ [value, datum] ];
            return client.train(data);
        }).then(([ result ]) => {
            let datum = [ [ ["foo", "bar"] ], [] ],
                data = [ datum ];
            return client.estimate(data);
        }).then(([ result ]) => {
            debug(result);
            expect(result.length).to.equal(1);
            result.forEach(estimate => {
                expect(estimate).to.be.a("number");
            });
            done();
        }).catch(done);
    });
});