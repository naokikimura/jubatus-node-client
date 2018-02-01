/*jslint node: true, passfail: false */

const expect = require('chai').expect;
const spawn = require('child_process').spawn;
const portfinder = require('portfinder');
const debug = require('debug')('jubatus-node-client:test:anomaly');
const jubatus = require('../index.js');

let server;
let client;

before(done => {
    const option = { port: Number(process.env.npm_package_config_test_port || 9199) };
    portfinder.getPortPromise(option).then(port => {
        debug(`port: ${ port }`);
        const executor = (resolve, reject) => {
            /*jslint nomen: true */
            const config = 'anomaly_config.json',
                command = 'jubaanomaly',
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
        client = new jubatus.anomaly.client.Anomaly(port, 'localhost');
        done();
    }).catch(done);
});

after(done => {
    client.getClient().close();
    server.kill();
    done();
});

describe('anomaly#clear_row', () => {
    it('clear_row', done => {
        const id = 'foo';
        client.clearRow(id).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean');
            expect(result).to.equal(true);
            done();
        }).catch(done);
    });
});

describe('anomaly#add', () => {
    it('add', done => {
        const datum = [ [ [ 'foo', 'bar' ] ], [ [ 'qux', 1.1 ] ], [] ];
        client.add(datum).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array');
            expect(result).to.deep.equal([ '0', Number.POSITIVE_INFINITY ]);
            done();
        }).catch(done);
    });
});

describe('anomaly#add_bulk', () => {
    it('add_bulk', done => {
        const data = [ 'foo', 'bar', 'baz' ].map((key, index) => ([ [], [ [ key, index ] ], [] ]));
        client.addBulk(data).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array');
            expect(result).to.deep.equal([ '1', '2', '3' ]);
            done();
        }).catch(done);
    });
});

describe('anomaly#update', () => {
    it('update', done => {
        const datum = [ [], [ [ 'quux', 1.1 ] ], [] ];
        client.add(datum).then(([ result ]) => {
            expect(result).to.deep.equal([ '4', 0.9982945919036865 ]);
            return client.update('4', [ [], [ [ 'quux', Number.MIN_VALUE ] ], [] ]);
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('number');
            expect(result).to.deep.equal(0.9982945919036865);            
            done();
        }).catch(done);
    });
});

describe('anomaly#overwrite', () => {
    it('overwrite', done => {
        const datum = [ [], [ [ 'quuz', 123 ] ], [] ];
        client.add(datum).then(([ result ]) => {
            expect(result).to.deep.equal([ '5', 0.999985933303833 ], 'add');
            return client.overwrite('5', [ [], [ [ 'quuz', Number.MIN_SAFE_INTEGER ] ], [] ]);
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('number');
            expect(result).to.equal(1, 'overwrite');            
            done();
        }).catch(done);
    });
});

describe('anomaly#calc_score', () => {
    it('calc_score', done => {
        const datum = [ [], [ [ 'foo', 2.3 ] ], [] ];
        client.calcScore(datum).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('number');
            expect(result).to.equal(1);
            done();
        }).catch(done);
    });
});

describe('anomaly#get_all_rows', () => {
    it('get_all_rows', done => {
        client.getAllRows().then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array');
            expect(result).to.have.members([ '0', '2', '3', '4', '5' ]);
            done();
        }).catch(done);
    });
});