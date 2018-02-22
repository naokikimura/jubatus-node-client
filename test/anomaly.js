/*jslint node: true, passfail: false */

const expect = require('chai').expect;
const debug = require('debug')('jubatus-node-client:test:anomaly');
const testUtil = require('./util');
const jubatus = require('../index.js');

let server;
let client;

before(done => {
    const command = 'jubaanomaly', config = 'anomaly_config.json';
    testUtil.createServerProcess(command, config).then(([ port, serverProcess ]) => {
        server = serverProcess;
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
        client.clearRow(id).then(result => {
            debug(result);
            expect(result).to.be.a('boolean');
            expect(result).to.equal(true);
            done();
        }).catch(done);
    });
});

describe('anomaly#add', () => {
    it('add', done => {
        const datum = new jubatus.common.types.Datum([['foo', 'bar']], [['qux', 1.1]], []);
        client.add(datum).then(result => {
            debug(result);
            expect(result).to.be.a('IdWithScore')
                .and.to.deep.equal(new jubatus.anomaly.types.IdWithScore('0', Number.POSITIVE_INFINITY));
            done();
        }).catch(done);
    });
});

describe('anomaly#add_bulk', () => {
    it('add_bulk', done => {
        const data = [ 'foo', 'bar', 'baz' ].map((key, index) => ([ [], [ [ key, index ] ], [] ]));
        client.addBulk(data).then(result => {
            debug(result);
            expect(result).to.be.a('array');
            expect(result).to.deep.equal([ '1', '2', '3' ]);
            done();
        }).catch(done);
    });
});

describe('anomaly#update', () => {
    it('update', done => {
        const datum = new jubatus.common.types.Datum([], [ [ 'quux', 1.1 ] ], []);
        client.add(datum).then(result => {
            expect(result, 'add').to.be.an('IdWithScore').and.to.have.property('id', '4');
            return client.update('4', [ [], [ [ 'quux', Number.MIN_VALUE ] ], [] ]);
        }).then(result => {
            debug(result);
            expect(result).to.be.a('number');
            done();
        }).catch(done);
    });
});

describe('anomaly#overwrite', () => {
    it('overwrite', done => {
        const datum = [ [], [ [ 'quuz', 123 ] ], [] ];
        client.add(datum).then(result => {
            expect(result, 'add').to.be.an('IdWithScore').and.to.have.property('id', '5');
            return client.overwrite('5', [ [], [ [ 'quuz', Number.MIN_SAFE_INTEGER ] ], [] ]);
        }).then(result => {
            debug(result);
            expect(result).to.be.a('number');
            done();
        }).catch(done);
    });
});

describe('anomaly#calc_score', () => {
    it('calc_score', done => {
        const datum = [ [], [ [ 'foo', 2.3 ] ], [] ];
        client.calcScore(datum).then(result => {
            debug(result);
            expect(result).to.be.a('number');
            done();
        }).catch(done);
    });
});

describe('anomaly#get_all_rows', () => {
    it('get_all_rows', done => {
        client.getAllRows().then(result => {
            debug(result);
            expect(result).to.be.a('array');
            expect(result).to.have.members([ '0', '2', '3', '4', '5' ]);
            done();
        }).catch(done);
    });
});