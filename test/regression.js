/*jslint node: true, passfail: false */

const expect = require('chai').expect;
const debug = require('debug')('jubatus-node-client:test:regression');
const testUtil = require('./util');
const jubatus = require('../index.js');

let server;
let client;

before(done => {
    const command = 'jubaregression', config = 'regression_config.json';
    testUtil.createServerProcess(command, config).then(([ port, serverProcess ]) => {
        server = serverProcess;
        client = new jubatus.regression.client.Regression(port, 'localhost');
        done();
    }).catch(done);
});

after(done => {
    client.getClient().close();
    server.kill();
    done();
});

describe('regression#train', () => {
    it('train', done => {
        const datum = new jubatus.common.types.Datum([['foo', 'bar']], []),
            value = 1.01,
            scoredDatum = new jubatus.regression.types.ScoredDatum(value, datum),
            data = [ scoredDatum ];
        client.train(data).then(result => {
            debug(result);
            expect(result).to.be.ok;
            expect(result).to.equal(1);
            done();
        }).catch(done);
    });
});

describe('regression#estimate', () => {
    it('estimate', done => {
        var datum = [ [ ['foo', 'bar'] ], [] ],
            data = [ datum ];
        client.estimate(data).then(result => {
            debug(result);
            expect(result.length).to.equal(1);

            var datum = [ [ ['foo', 'bar'] ], [] ],
                value = 1,
                data = [ [value, datum] ];
            return client.train(data);
        }).then(result => {
            expect(result).to.equal(1);
            let datum = [ [ ['foo', 'bar'] ], [] ],
                data = [ datum ];
            return client.estimate(data);
        }).then(result => {
            debug(result);
            expect(result.length).to.equal(1);
            result.forEach(estimate => {
                expect(estimate).to.be.a('number');
            });
            done();
        }).catch(done);
    });
});