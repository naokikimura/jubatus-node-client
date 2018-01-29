/*jslint node: true, passfail: false */

const expect = require('chai').expect;
const spawn = require('child_process').spawn;
const portfinder = require('portfinder');
const debug = require('debug')('jubatus-node-client:test:stat');
const jubatus = require('../index.js');

let server;
let client;

before(done => {
    const option = { port: Number(process.env.npm_package_config_test_port || 9199) };
    portfinder.getPortPromise(option).then(port => {
        debug(`port: ${ port }`);
        const executor = (resolve, reject) => {
            /*jslint nomen: true */
            const config = 'stat_config.json',
                command = 'jubastat',
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
        client = new jubatus.stat.client.Stat(port, 'localhost');
        done();
    }).catch(done);
});

after(done => {
    client.getClient().close();
    server.kill();
    done();
});

describe('stat#push', () => {
    it('push', done => {
        const key = "foo",
            value = 1.01;
        client.push(key, value).then(([ result ]) => {
            debug(result);
            expect(result).to.be.ok;
            done();
        }).catch(done);
    });
});

describe('stat#sum', () => {
    it('sum', done => {
        const key = "foo",
            values = [1, 1.2, 0],
            expected = values.reduce((previous, current) => previous + current, 0);
        client.clear()
        .then(() => Promise.all(values.map(value => client.push(key, value))))
        .then(() => client.sum(key))
        .then(([ result ]) => {
            debug(result);
            expect(result).to.equal(expected);
            done();
        }).catch(done);
    });
});

describe('stat#stddev', () => {
    it('stddev', done => {
        const key = "foo",
            values = [1, 1.2, 0];
        client.clear()
        .then(() => Promise.all(values.map(value => client.push(key, value))))
        .then(() => client.stddev(key))
        .then(([ result ]) => {
            debug(result);
            expect(result).to.be.a("number");
            done();
        }).catch(done);
    });
});

describe('stat#max', () => {
    it('max', done => {
        const key = "foo",
            values = [1, 1.2, 0],
            expected = values.reduce((previous, current) => Math.max(previous, current), Number.MIN_VALUE);
        client.clear()
        .then(() => Promise.all(values.map(value => client.push(key, value))))
        .then(() => client.max(key))
        .then(([ result ]) => {
            debug(result);
            expect(result).to.equal(expected);
            done();
        }).catch(done);
    });
});

describe('stat#min', () => {
    it('min', done => {
        const key = "foo",
            values = [1, 1.2, 0, -1],
            expected = values.reduce((previous, current) => Math.min(previous, current), Number.MAX_VALUE);
        client.clear()
        .then(() => Promise.all(values.map(value => client.push(key, value))))
        .then(() => client.min(key))
        .then(([ result ]) => {
            debug(result);
            expect(result).to.be.a("number");
            expect(result).to.equal(expected);
            done();
        }).catch(done);
    });
});

describe('stat#entropy', () => {
    it('entropy', done => {
        const key = "foo",
            values = [1, 1.2, 10, 100];
        client.clear()
        .then(() => Promise.all(values.map(value => client.push(key, value))))
        .then(() => client.entropy(key))
        .then(([ result ]) => {
            debug(result);
            expect(result).to.be.a("number");
            done();
        }).catch(done);
    });
});

describe('stat#moment', () => {
    it('moment', done => {
        const key = "foo",
            values = [1, 1.2, 0],
            degree = 1,
            center = 1.1;
        client.clear()
        .then(() => Promise.all(values.map(value => client.push(key, value))))
        .then(() => client.moment(key, degree, center))
        .then(([ result ]) => {
            debug(result);
            expect(result).to.be.a("number");
            done();
        }).catch(done);
    });
});