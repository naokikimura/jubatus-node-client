/*jslint node: true, passfail: false */

const expect = require('chai').expect;
const spawn = require('child_process').spawn;
const portfinder = require('portfinder');
const debug = require('debug')('jubatus-node-client:test:nearest_neighbor');
const jubatus = require('../index.js');

let server;
let client;

before(done => {
    const option = { port: Number(process.env.npm_package_config_test_port || 9199) };
    portfinder.getPortPromise(option).then(port => {
        debug(`port: ${ port }`);
        const executor = (resolve, reject) => {
            /*jslint nomen: true */
            const config = 'nearest_neighbor_config.json',
                command = 'jubanearest_neighbor',
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
        client = new jubatus.nearestneighbor.client.NearestNeighbor(port, 'localhost');
        done();
    }).catch(done);
});

after(done => {
    client.getClient().close();
    server.kill();
    done();
});

describe('nearest_neighbor#set_row', () => {
    it('set_row', done => {
        const id = 'foobar';
        const datum = [ [ [ 'foo', 'bar' ] ], [ [ 'qux', 1.1 ] ], [] ];
        client.setRow(id, datum).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean');
            expect(result).to.equal(true);
            done();
        }).catch(done);
    });
});

describe('nearest_neighbor#neighbor_row_from_id', () => {
    it('neighbor_row_from_id', done => {
        const id = 'foobar', size = 1;
        client.neighborRowFromId(id, size).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array');
            expect(result).to.deep.equal([ [ id, 0 ] ]);
            done();
        }).catch(done);
    });
});

describe('nearest_neighbor#neighbor_row_from_datum', () => {
    it('neighbor_row_from_datum', done => {
        const datum = [ [ [ 'foo', 'bar' ] ], [ [ 'qux', 1.1 ] ], [] ];
        const size = 1;
        client.neighborRowFromDatum(datum, size).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array');
            expect(result).to.deep.equal([ [ 'foobar', 0 ] ]);
            done();
        }).catch(done);
    });
});

describe('nearest_neighbor#similar_row_from_id', () => {
    it('similar_row_from_id', done => {
        const id = 'foobar', retNum = 1;
        client.similarRowFromId(id, retNum).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array');
            expect(result).to.deep.equal([ [ id, 1 ] ]);
            done();
        }).catch(done);
    });
});

describe('nearest_neighbor#similar_row_from_datum', () => {
    it('similar_row_from_datum', done => {
        const datum = [ [ [ 'foo', 'bar' ] ], [ [ 'qux', 1.1 ] ], [] ];
        const retNum = 1;
        client.neighborRowFromDatum(datum, retNum).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array');
            expect(result).to.deep.equal([ [ 'foobar', 0 ] ]);
            done();
        }).catch(done);
    });
});

describe('nearest_neighbor#get_all_rows', () => {
    it('get_all_rows', done => {
        client.getAllRows().then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array');
            expect(result).to.deep.equal([ 'foobar' ]);
            done();
        }).catch(done);
    });
});