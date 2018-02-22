/*jslint node: true, passfail: false */

const expect = require('chai').expect;
const debug = require('debug')('jubatus-node-client:test:weight');
const testUtil = require('./util');
const jubatus = require('../index.js');

let server;
let client;
before(done => {
    const command = 'jubaweight', config = 'weight_config.json';
    testUtil.createServerProcess(command, config).then(([ port, serverProcess ]) => {
        server = serverProcess;
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
        const stringValues = [ [ 'foo', 'bar' ] ];
        const numValues = [ [ 'qux', 1.1 ] ];
        const binaryValues = [];
        const datum = new jubatus.common.types.Datum(stringValues, numValues, binaryValues);
        client.update(datum).then(result => {
            debug(result);
            expect(result).to.be.a('array')
                .and.to.have.lengthOf(1)
                .and.to.have.to.nested.property('[0]')
                .and.to.be.a('Feature');
            done();
        }).catch(done);
    });
});

describe('weight#calc_weight', () => {
    it('calc_weight', done => {
        const stringValues = [ [ 'foo', 'bar' ] ];
        const numValues = [ [ 'qux', 1.1 ] ];
        const binaryValues = [];
        const datum = [ stringValues, numValues, binaryValues ];
        client.calcWeight(datum).then(result => {
            debug(result);
            expect(result).to.be.a('array')
                .and.to.have.lengthOf(1)
                .and.to.have.to.nested.property('[0]')
                .and.to.be.a('Feature');
            done();
        }).catch(done);
    });
});