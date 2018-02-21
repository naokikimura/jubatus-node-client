/*jslint node: true, passfail: false */

const expect = require('chai').expect;
const debug = require('debug')('jubatus-node-client:test:nearest_neighbor');
const testUtil = require('./util');
const jubatus = require('../index.js');

let server;
let client;

before(done => {
    const command = 'jubanearest_neighbor', config = 'nearest_neighbor_config.json';
    testUtil.createServerProcess(command, config).then(([ port, serverProcess ]) => {
        server = serverProcess;
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
        const datum = new jubatus.common.types.Datum([['foo', 'bar']], [['qux', 1.1]], []);
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
            expect(result).to.be.a('array')
                .and.to.have.lengthOf(1)
                .and.to.have.to.nested.property('[0]')
                .and.to.deep.equal(jubatus.nearestneighbor.types.IdWithScore.fromTuple([ id, 0 ]));
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
            expect(result).to.be.a('array')
                .and.to.have.lengthOf(1)
                .and.to.have.to.nested.property('[0]')
                .and.to.deep.equal(jubatus.nearestneighbor.types.IdWithScore.fromTuple([ 'foobar', 0 ]));
            done();
        }).catch(done);
    });
});

describe('nearest_neighbor#similar_row_from_id', () => {
    it('similar_row_from_id', done => {
        const id = 'foobar', retNum = 1;
        client.similarRowFromId(id, retNum).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array')
                .and.to.have.lengthOf(1)
                .and.to.have.to.nested.property('[0]')
                .and.to.deep.equal(jubatus.nearestneighbor.types.IdWithScore.fromTuple([ id, 1 ]));
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
            expect(result).to.be.a('array')
                .and.to.have.lengthOf(1)
                .and.to.have.to.nested.property('[0]')
                .and.to.deep.equal(jubatus.nearestneighbor.types.IdWithScore.fromTuple([ 'foobar', 0 ]));
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