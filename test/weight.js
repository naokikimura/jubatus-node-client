/*jslint node: true, passfail: false */

const expect = require('chai').expect;
const spawn = require('child_process').spawn;
const portfinder = require('portfinder');
const debug = require('debug')('jubatus-node-client:test:weight');
const jubatus = require('../index.js');

let server;
let client;

before(done => {
    const option = { port: Number(process.env.npm_package_config_test_port || 9199) };
    portfinder.getPortPromise(option).then(port => {
        debug(`port: ${ port }`);
        const executor = (resolve, reject) => {
            /*jslint nomen: true */
            const config = 'weight_config.json',
                command = 'jubaweight',
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
        client = new jubatus.weight.client.Weight(port, 'localhost');
        done();
    }).catch(done);
});

after(done => {
    client.getClient().close();
    server.kill();
    done();
});

describe('weight#update', () => {
    it('update', done => {
        const string_values = [ [ "foo", "bar" ] ];
        const num_values = [ [ "qux", 1.1 ] ];
        const binary_values = [];
        const datum = [ string_values, num_values, binary_values ];
        client.update(datum).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array');
            done();
        }).catch(done);
    });
});

describe('weight#calc_weight', () => {
    it('calc_weight', done => {
        const string_values = [ [ "foo", "bar" ] ];
        const num_values = [ [ "qux", 1.1 ] ];
        const binary_values = [];
        const datum = [ string_values, num_values, binary_values ];
        client.calcWeight(datum).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array');
            done();
        }).catch(done);
    });
});