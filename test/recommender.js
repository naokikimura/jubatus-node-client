/*jslint node: true, passfail: false */

const expect = require('chai').expect;
const spawn = require('child_process').spawn;
const portfinder = require('portfinder');
const debug = require('debug')('jubatus-node-client:test:recommender');
const jubatus = require('../index.js');

let server;
let client;

before(done => {
    const option = { port: Number(process.env.npm_package_config_test_port || 9199) };
    portfinder.getPortPromise(option).then(port => {
        debug(`port: ${ port }`);
        const executor = (resolve, reject) => {
            /*jslint nomen: true */
            const config = 'recommender_config.json',
                command = 'jubarecommender',
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
        client = new jubatus.recommender.client.Recommender(port, 'localhost');
        done();
    }).catch(done);
});

after(done => {
    client.getClient().close();
    server.kill();
    done();
});

describe('recommender#clear_row', () => {
    it('clear_row', done => {
        const id = 'foo';
        client.clearRow(id).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean').and.to.equal(true);
            done();
        }).catch(done);
    });
});

describe('recommender#update_row', () => {
    it('update_row', done => {
        const id = 'foo';
        const datum = [ [], [ [ 'bar', 1.2 ], [ 'baz', 3.4 ]  ], [] ];
        client.updateRow(id, datum).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean').and.to.equal(true);
            done();
        }).catch(done);
    });
});

describe('recommender#complete_row_from_id', () => {
    it('complete_row_from_id', done => {
        const id = 'foo';
        client.completeRowFromId(id).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array')
                .and.to.have.nested.property('[1][0][0]', 'bar');
            done();
        }).catch(done);
    });
});

describe('recommender#complete_row_from_datum', () => {
    it('complete_row_from_datum', done => {
        const datum = [ [], [ [ 'bar', 1.2 ] ], [] ];
        client.completeRowFromDatum(datum).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array')
                .and.to.have.nested.property('[1][1][0]', 'baz');
            done();
        }).catch(done);
    });
});

describe('recommender#similar_row_from_id', () => {
    it('similar_row_from_id', done => {
        const id = 'foo', size = 1;
        client.similarRowFromId(id, size).then(([ result ]) => {
            debug(result);
            expect(result).to.be.an('array')
                .and.to.have.deep.members([ [ 'foo', 1 ] ]);
            done();
        }).catch(done);
    });
});

describe('recommender#similar_row_from_id_and_score', () => {
    it('similar_row_from_id_and_score', done => {
        const id = 'foo', score = 1;
        client.similarRowFromIdAndScore(id, score).then(([ result ]) => {
            debug(result);
            expect(result).to.be.an('array')
                .and.to.have.deep.members([ [ 'foo', 1 ] ]);
            done();
        }).catch(done);
    });
});

describe('recommender#similar_row_from_id_and_rate', () => {
    it('similar_row_from_id_and_rate', done => {
        const id = 'foo', rate = 0.9;
        client.similarRowFromIdAndRate(id, rate).then(([ result ]) => {
            debug(result);
            expect(result).to.be.an('array')
                .and.to.have.deep.members([ [ 'foo', 1 ] ]);
            done();
        }).catch(done);
    });
});

describe('recommender#similar_row_from_datum', () => {
    it('similar_row_from_datum', done => {
        const datum = [ [], [ [ 'bar', 1.2 ] ], [] ];
        const size = 1;
        client.similarRowFromDatum(datum, size).then(([ result ]) => {
            debug(result);
            expect(result).to.be.an('array')
                .and.to.have.nested.property('[0][0]', 'foo');
            done();
        }).catch(done);
    });
});

describe('recommender#similar_row_from_datum_and_score', () => {
    it('similar_row_from_datum_and_score', done => {
        const datum = [ [], [ [ 'bar', 1.2 ] ], [] ];
        const score = 0.1;
        client.similarRowFromDatumAndScore(datum, score).then(([ result ]) => {
            debug(result);
            expect(result).to.be.an('array')
                .and.to.have.nested.property('[0][0]', 'foo');
            done();
        }).catch(done);
    });
});

describe('recommender#similar_row_from_datum_and_rate', () => {
    it('similar_row_from_datum_and_rate', done => {
        const datum = [ [], [ [ 'bar', 1.2 ] ], [] ];
        const rate = 0.9;
        client.similarRowFromDatumAndRate(datum, rate).then(([ result ]) => {
            debug(result);
            expect(result).to.be.an('array')
                .and.to.have.nested.property('[0][0]', 'foo');
            done();
        }).catch(done);
    });
});

describe('recommender#decode_row', () => {
    it('decode_row', done => {
        const id = 'foo';
        client.decodeRow(id).then(([ result ]) => {
            debug(result);
            expect(result).to.be.an('array')
                .and.to.have.nested.property('[1][0][0]', 'bar');
            done();
        }).catch(done);
    });
});

describe('recommender#get_all_rows', () => {
    it('get_all_rows', done => {
        client.getAllRows().then(([ result ]) => {
            debug(result);
            expect(result).to.be.an('array')
                .and.to.include('foo');
            done();
        }).catch(done);
    });
});

describe('recommender#calc_similarity', () => {
    it('calc_similarity', done => {
        const lhs =[ [], [ [ 'bar', 1.2 ], [ 'baz', 3.4 ]  ], [] ];
        const rhs =[ [], [ [ 'bar', 1.2 ], [ 'baz', 3.4 ]  ], [] ];
        client.calcSimilarity(lhs, rhs).then(([ result ]) => {
            debug(result);
            expect(result).to.be.an('number')
                .and.to.equal(1);
            done();
        }).catch(done);
    });
});

describe('recommender#calc_l2norm', () => {
    it('calc_l2norm', done => {
        const datum =[ [], [ [ 'bar', 1.2 ], [ 'baz', 3.4 ]  ], [] ];
        client.calcL2norm(datum).then(([ result ]) => {
            debug(result);
            expect(result).to.be.an('number');
            done();
        }).catch(done);
    });
});