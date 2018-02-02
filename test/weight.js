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
        const string_values = [ [ 'foo', 'bar' ] ];
        const num_values = [ [ 'qux', 1.1 ] ];
        const binary_values = [];
        const datum = [ string_values, num_values, binary_values ];
        client.update(datum).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array');
            done();
        }).catch(done);
    });
});

describe('weight#calc_weight', () => {
    it('calc_weight', done => {
        const string_values = [ [ 'foo', 'bar' ] ];
        const num_values = [ [ 'qux', 1.1 ] ];
        const binary_values = [];
        const datum = [ string_values, num_values, binary_values ];
        client.calcWeight(datum).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array');
            done();
        }).catch(done);
    });
});