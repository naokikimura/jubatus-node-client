/*jslint node: true, passfail: false */

const expect = require('chai').expect;
const debug = require('debug')('jubatus-node-client:test:clustering');
const testUtil = require('./util');
const jubatus = require('../index.js');

let server;
let client;

before(done => {
    const command = 'jubaclustering', config = 'clustering_config.json';
    testUtil.createServerProcess(command, config).then(([ port, serverProcess ]) => {
        server = serverProcess;
        client = new jubatus.clustering.client.Clustering(port, 'localhost');
        done();
    }).catch(done);
});

after(done => {
    client.getClient().close();
    server.kill();
    done();
});

describe('clustering#push', () => {
    it('push', done => {
        const variables = [
            'foo', 'bar', 'baz', 'qux', 'quux', 'quuz',
            'corge', 'grault', 'garply', 'waldo', 'fred',
            'plugh', 'xyzzy', 'thud'
        ];
        const points = Array.apply(null, { length: 1000 }).map((v, i) => {
            const index = Math.floor(Math.random() * variables.length);
            const variable = variables[index];
            const datum = new jubatus.common.types.Datum([ [ 'foobar', variable ] ]);
            return new jubatus.clustering.types.IndexedPoint('' + i, datum);
        });
        client.push(points).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean');
            expect(result).to.equal(true);
            done();
        }).catch(done);
    });
});

describe('clustering#get_revision', () => {
    it('get_revision', done => {
        client.getRevision().then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('number');
            expect(result).to.equal(1);
            done();
        }).catch(done);
    });
});

describe('clustering#get_core_members', () => {
    it('get_core_members', done => {
        client.getCoreMembers().then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array')
                .and.to.have.lengthOf.above(1)
                .and.to.have.to.nested.property('[0][0]')
                .and.to.be.a('WeightedDatum');
            done();
        }).catch(done);
    });
});

describe('clustering#get_core_members_light', () => {
    it('get_core_members_light', done => {
        client.getCoreMembersLight().then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array')
                .and.to.have.lengthOf.above(1)
                .and.to.have.to.nested.property('[0][0]')
                .and.to.be.a('WeightedIndex');
            done();
        }).catch(done);
    });
});

describe('clustering#get_k_center', () => {
    it('get_k_center', done => {
        client.getKCenter().then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array')
                .and.to.have.lengthOf.above(1)
                .and.to.have.to.nested.property('[0]')
                .and.to.be.a('Datum');
            done();
        }).catch(done);
    });
});

describe('clustering#get_nearest_center', () => {
    it('get_nearest_center', done => {
        const datum = [ [ [ 'foo', 'bar' ] ] ];
        client.getNearestCenter(datum).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('Datum');
            done();
        }).catch(done);
    });
});

describe('clustering#get_nearest_members', () => {
    it('get_nearest_members', done => {
        const datum = [ [ [ 'foo', 'bar' ] ] ];
        client.getNearestMembers(datum).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array')
                .and.to.have.lengthOf.above(1)
                .and.to.have.to.nested.property('[0]')
                .and.to.be.a('WeightedDatum');
            done();
        }).catch(done);
    });
});

describe('clustering#get_nearest_members_light', () => {
    it('get_nearest_members_light', done => {
        const datum = [ [ [ 'foo', 'bar' ] ] ];
        client.getNearestMembersLight(datum).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array')
                .and.to.have.lengthOf.above(1)
                .and.to.have.to.nested.property('[0]')
                .and.to.be.a('WeightedIndex');
            done();
        }).catch(done);
    });
});