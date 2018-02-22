/*jslint node: true, passfail: false */

const expect = require('chai').expect;
const debug = require('debug')('jubatus-node-client:test:classifier');
const testUtil = require('./util');
const jubatus = require('../index.js');

let server;
let client;

before(done => {
    const command = 'jubaclassifier', config = 'classifier_config.json';
    testUtil.createServerProcess(command, config).then(([ port, serverProcess ]) => {
        server = serverProcess;
        client = new jubatus.classifier.client.Classifier(port, 'localhost');
        done();
    }).catch(done);
});

after(done => {
    client.getClient().close();
    server.kill();
    done();
});

describe('classifier#train', () => {
    it('train', done => {
        const datum = new jubatus.common.types.Datum([ [ 'foo', 'bar' ] ], [ [ 'qux', 1.1 ] ]),
            labeledDatum = new jubatus.classifier.types.LabeledDatum('baz', datum),
            data = [ labeledDatum ];
        client.train(data).then(result => {
            debug(result);
            expect(result).to.be.ok;
            expect(result).to.equal(1);
            done();
        }).catch(done);
    });
});

describe('classifier#classify', () => {
    it('classify', done => {
        const datum = new jubatus.common.types.Datum().addString('foo', 'bar').addNumber('qux', 1.1),
            data = [ datum ];
        client.classify(data).then(result => {
            debug(result);
            expect(result.length).to.equal(1);

            let datum = [ [ [ 'foo', 'bar' ] ], [ [ 'qux', 1 ] ] ],
                label = 'baz',
                data = [ [ label, datum ] ];
            return client.train(data);
        }).then(result => {
            expect(result).to.equal(1);
            let datum = [ [ [ 'foo', 'bar' ] ] ],
                data = [ datum ];
            return client.classify(data);
        }).then(result => {
            debug(result);
            expect(result).to.be.an('array')
                .and.to.have.lengthOf(1)
                .and.to.have.to.nested.property('[0][0]')
                .and.to.be.a('EstimateResult')
                .and.to.have.property('label', 'baz');
            done();
        }).catch(done);
    });
});

describe('classifier#get_labels', () => {
    it('get_labels', done => {
        client.getLabels().then(result => {
            debug(result);
            expect(result).to.be.a('object');
            done();
        }).catch(done);
    });
});

describe('classifier#set_label', () => {
    it('set_label', done => {
        const label = 'foo';
        client.clear().then(result => {
            expect(result).to.equal(true);
            return client.setLabel(label);
        }).then(result => {
            expect(result).to.equal(true);
            return client.getLabels();
        }).then(result => {
            debug(result);
            expect(result).to.be.a('object');
            expect(result).to.deep.equal({ [label]: 0 });
            done();
        }).catch(done);
    });
});

describe('classifier#delete_label', () => {
    it('delete_label', done => {
        const label = 'foo';
        client.clear().then(result => {
            expect(result).to.equal(true);
            return client.setLabel(label);
        }).then(result => {
            expect(result).to.equal(true);
            return client.getLabels();
        }).then(result => {
            expect(result).to.deep.equal({ [label]: 0 });
            return client.deleteLabel(label);
        }).then(result => {
            expect(result).to.equal(true);
            return client.getLabels();
        }).then(result => {
            debug(result);
            expect(result).to.be.a('object');
            expect(result).to.deep.equal({});
            done();
        }).catch(done);
    });
});