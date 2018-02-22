/*jslint node: true, passfail: false */

const expect = require('chai').expect;
const debug = require('debug')('jubatus-node-client:test:recommender');
const testUtil = require('./util');
const jubatus = require('../index.js');

let server;
let client;

before(done => {
    const command = 'jubarecommender', config = 'recommender_config.json';
    testUtil.createServerProcess(command, config).then(([ port, serverProcess ]) => {
        server = serverProcess;
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
        client.clearRow(id).then(result => {
            debug(result);
            expect(result).to.be.a('boolean').and.to.equal(true);
            done();
        }).catch(done);
    });
});

describe('recommender#update_row', () => {
    it('update_row', done => {
        const id = 'foo';
        const datum = new jubatus.common.types.Datum([], [['bar', 1], ['baz', 3]], []);
        client.updateRow(id, datum).then(result => {
            debug(result);
            expect(result).to.be.a('boolean').and.to.equal(true);
            done();
        }).catch(done);
    });
});

describe('recommender#complete_row_from_id', () => {
    it('complete_row_from_id', done => {
        const id = 'foo';
        const expected = new jubatus.common.types.Datum([], [['bar', 1], ['baz', 3]], []);
        client.completeRowFromId(id).then(result => {
            debug(result);
            expect(result).to.be.a('Datum')
                .and.to.deep.equal(expected);
            done();
        }).catch(done);
    });
});

describe('recommender#complete_row_from_datum', () => {
    it('complete_row_from_datum', done => {
        const datum = [ [], [ [ 'bar', 1 ] ], [] ];
        const expected = new jubatus.common.types.Datum([], [['bar', 1], ['baz', 3]], []);
        client.completeRowFromDatum(datum).then(result => {
            debug(result);
            expect(result).to.be.a('Datum')
                .and.to.deep.equal(expected);
            done();
        }).catch(done);
    });
});

describe('recommender#similar_row_from_id', () => {
    it('similar_row_from_id', done => {
        const id = 'foo', size = 1;
        client.similarRowFromId(id, size).then(result => {
            debug(result);
            expect(result).to.be.an('array')
                .and.to.have.lengthOf(1)
                .and.to.have.to.nested.property('[0]')
                .and.to.deep.equal(jubatus.recommender.types.IdWithScore.fromTuple([ id, 1 ]));
            done();
        }).catch(done);
    });
});

describe('recommender#similar_row_from_id_and_score', () => {
    it('similar_row_from_id_and_score', done => {
        const id = 'foo', score = 1;
        client.similarRowFromIdAndScore(id, score).then(result => {
            debug(result);
            expect(result).to.be.an('array')
                .and.to.have.lengthOf(1)
                .and.to.have.to.nested.property('[0]')
                .and.to.deep.equal(jubatus.recommender.types.IdWithScore.fromTuple([ id, 1 ]));
            done();
        }).catch(done);
    });
});

describe('recommender#similar_row_from_id_and_rate', () => {
    it('similar_row_from_id_and_rate', done => {
        const id = 'foo', rate = 0.9;
        client.similarRowFromIdAndRate(id, rate).then(result => {
            debug(result);
            expect(result).to.be.an('array')
                .and.to.have.lengthOf(1)
                .and.to.have.to.nested.property('[0]')
                .and.to.deep.equal(jubatus.recommender.types.IdWithScore.fromTuple([ id, 1 ]));
            done();
        }).catch(done);
    });
});

describe('recommender#similar_row_from_datum', () => {
    it('similar_row_from_datum', done => {
        const datum = [ [], [ [ 'bar', 1.2 ] ], [] ];
        const size = 1;
        client.similarRowFromDatum(datum, size).then(result => {
            debug(result);
            expect(result).to.be.an('array')
                .and.to.have.lengthOf(1)
                .and.to.have.to.nested.property('[0]')
                .and.to.be.a('IdWithScore')
                .and.to.have.to.nested.property('id', 'foo');
            done();
        }).catch(done);
    });
});

describe('recommender#similar_row_from_datum_and_score', () => {
    it('similar_row_from_datum_and_score', done => {
        const datum = [ [], [ [ 'bar', 1.2 ] ], [] ];
        const score = 0.1;
        client.similarRowFromDatumAndScore(datum, score).then(result => {
            debug(result);
            expect(result).to.be.an('array')
                .and.to.have.lengthOf(1)
                .and.to.have.to.nested.property('[0]')
                .and.to.be.a('IdWithScore')
                .and.to.have.to.nested.property('id', 'foo');
            done();
        }).catch(done);
    });
});

describe('recommender#similar_row_from_datum_and_rate', () => {
    it('similar_row_from_datum_and_rate', done => {
        const datum = [ [], [ [ 'bar', 1.2 ] ], [] ];
        const rate = 0.9;
        client.similarRowFromDatumAndRate(datum, rate).then(result => {
            debug(result);
            expect(result).to.be.an('array')
                .and.to.have.lengthOf(1)
                .and.to.have.to.nested.property('[0]')
                .and.to.be.a('IdWithScore')
                .and.to.have.to.nested.property('id', 'foo');
            done();
        }).catch(done);
    });
});

describe('recommender#decode_row', () => {
    it('decode_row', done => {
        const id = 'foo';
        client.decodeRow(id).then(result => {
            debug(result);
            expect(result).to.be.an('Datum')
                .and.to.have.nested.property('numValues[0][0]', 'bar');
            done();
        }).catch(done);
    });
});

describe('recommender#get_all_rows', () => {
    it('get_all_rows', done => {
        client.getAllRows().then(result => {
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
        client.calcSimilarity(lhs, rhs).then(result => {
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
        client.calcL2norm(datum).then(result => {
            debug(result);
            expect(result).to.be.an('number');
            done();
        }).catch(done);
    });
});