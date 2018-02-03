/*jslint node: true, passfail: false */

const expect = require('chai').expect;
const debug = require('debug')('jubatus-node-client:test:common');
const testUtil = require('./util');
const jubatus = require('../');
const rpc = require('../lib/msgpack-rpc');

let server;
let client;

before(done => {
    const command = 'jubaclassifier', config = 'classifier_config.json';
    testUtil.createServerProcess(command, config).then(([ port, serverProcess ]) => {
        server = serverProcess;
        client = new jubatus.classifier.client.Classifier(rpc.createClient(port));
        done();
    }).catch(done);
});

after(done => {
    client.getClient().close();
    server.kill();
    done();
});

describe('common#name', () => {
    it('set_name', done => {
        expect(client.getName()).to.equal('');
        const name = 'test';
        client.setName(name);
        expect(client).to.has.property('name', name);
        done();
    });
});

describe('common#save', () => {
    it('save', done => {
        const id = 'test';
        client.save(id).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('object');
            done();
        }).catch(done);
    });
});

describe('common#load', () => {
    it('load', done => {
        const id = 'test';
        client.load(id).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean');
            done();
        }).catch(done);
    });
});

describe('common#clear', () => {
    it('clear', done => {
        client.clear((error, result) => {
            if (error) {
                done(error);
            } else {
                debug(result);
                expect(result).to.be.a('boolean');
                done();
            }
        });
    });
});

describe('common#get_config', () => {
    it('get_config', done => {
        client.getConfig().then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('string');
            done();
        }).catch(done);
    });
});

describe('common#get_status', () => {
    it('get_status', done => {
        client.getStatus().then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('object');
            done();
        }).catch(done);
    });
});

describe('common#do_mix', () => {
    it('do_mix', done => {
        client.doMix()
        .then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean');
            done();
        })
        .catch(error => {
            debug(error);
            expect(error).to.be.ok;
            done();
        });
    });
});

describe('common#get_proxy_status', () => {
    it('get_proxy_status', done => {
        client.getProxyStatus((error, result) => {
            if (error) {
                debug(error);
                expect(error).to.be.ok;
                done();
            } else {
                debug(result);
                expect(result).to.be.a('object');
                done();
            }
        });
    });
});