/*jslint node: true, passfail: false */

const expect = require('chai').expect;
const spawn = require('child_process').spawn;
const portfinder = require('portfinder');
const debug = require('debug')('jubatus-node-client:test:common');
const jubatus = require('../index.js');

let server;
let client;

before(done => {
    const option = { port: Number(process.env.npm_package_config_test_port || 9199) };
    portfinder.getPortPromise(option).then(port => {
        debug(`port: ${ port }`);
        const executor = (resolve, reject) => {
            /*jslint nomen: true */
            const config = 'common_config.json',
                command = 'jubaclassifier',
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
        client = new jubatus.classifier.client.Classifier(port, 'localhost');
        done();
    }).catch(done);
});

after(done => {
    client.getClient().close();
    server.kill();
    done();
});

describe('common#save', () => {
    it('save', done => {
        var id = 'test';
        client.save(id).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('object');
            done();
        }).catch(done);
    });
});

describe('common#load', () => {
    it('load', done => {
        var id = 'test';
        client.load(id).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean');
            done();
        }).catch(done);
    });
});

describe('common#clear', () => {
    it('clear', done => {
        client.clear().then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean');
            done();
        }).catch(done);
    });
});

describe('common#get_config', () => {
    it('get_config', done => {
        client.getConfig().then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('string');
            done();
        }).catch(done);
    });
});

describe('common#get_status', () => {
    it('get_status', done => {
        client.getStatus().then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('object');
            done();
        }).catch(done);
    });
});

describe('common#do_mix', () => {
    it('do_mix', done => {
        client.doMix()
        .then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean');
            done();
        })
        .catch(error => {
            debug(error);
            expect(error).to.be.ok;
            done();
        });
    });
});

describe('common#get_proxy_status', () => {
    it('get_proxy_status', done => {
        client.getProxyStatus()
        .then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('object');
            done();
        })
        .catch(error => {
            debug(error);
            expect(error).to.be.ok;
            done();
        });
    });
});