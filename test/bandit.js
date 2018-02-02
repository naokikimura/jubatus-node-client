/*jslint node: true, passfail: false */

const expect = require('chai').expect;
const debug = require('debug')('jubatus-node-client:test:bandit');
const testUtil = require('./util');
const jubatus = require('../index.js');

let server;
let client;

before(done => {
    const command = 'jubabandit', config = 'bandit_config.json';
    testUtil.createServerProcess(command, config).then(([ port, serverProcess ]) => {
        server = serverProcess;
        client = new jubatus.bandit.client.Bandit(port, 'localhost');
        done();
    }).catch(done);
});

after(done => {
    client.getClient().close();
    server.kill();
    done();
});

describe('bandit#register_arm', () => {
    it('register_arm', done => {
        const armId = 'foo';
        client.registerArm(armId).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean');
            expect(result).to.equal(true);
            done();
        }).catch(done);
    });
});

describe('bandit#delete_arm', () => {
    it('delete_arm', done => {
        const armId = 'foo';
        client.clear().then(([ result ]) => {
            expect(result).to.be.a('boolean');
            expect(result).to.equal(true);

            return client.deleteArm(armId);
        }).then(([ result ]) => {
            expect(result).to.be.a('boolean');
            expect(result).to.equal(false);

            return client.registerArm(armId);
        }).then(([ result ]) => {
            expect(result).to.be.a('boolean');
            expect(result).to.equal(true);

            return client.deleteArm(armId);
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean');
            expect(result).to.equal(true);
            done();
        }).catch(done);
    });
});

describe('bandit#select_arm', () => {
    it('select_arm', done => {
        const armId = 'foo';
        const playerId = 'bar';
        const reward = 1.08;
        client.clear().then(([ result ]) => {
            expect(result).to.be.a('boolean');
            expect(result).to.equal(true, 'clear');

            return client.registerArm(armId);
        }).then(([ result ]) => {
            expect(result).to.be.a('boolean');
            expect(result).to.equal(true, 'register_arm');

            return client.registerReward(playerId, armId, reward);
        }).then(([ result ]) => {
            expect(result).to.be.a('boolean');
            expect(result).to.equal(true, 'register_reward');

            return client.selectArm(playerId);
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('string');
            expect(result).to.equal(armId, 'select_arm');

            return client.getArmInfo(playerId);
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('object');
            expect(result).to.deep.equal({ [armId]: [ 1, reward ] }, 'get_arm_info');
            done();
        }).catch(done);
    });
});

describe('bandit#register_reward', () => {
    it('register_reward', done => {
        const armId = 'foo';
        const playerId = 'bar';
        const reward = 1.08;
        client.clear().then(([ result ]) => {
            expect(result).to.be.a('boolean');
            expect(result).to.equal(true, 'clear');

            return client.registerArm(armId);
        }).then(([ result ]) => {
            expect(result).to.be.a('boolean');
            expect(result).to.equal(true, 'register_arm');

            return client.registerReward(playerId, armId, reward);
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean');
            expect(result).to.equal(true, 'register_reward');
            done();
        }).catch(done);
    });
});

describe('bandit#get_arm_info', () => {
    it('get_arm_info', done => {
        const armId = 'foo';
        const playerId = 'bar';
        const reward = 1.08;
        client.clear().then(([ result ]) => {
            expect(result).to.be.a('boolean');
            expect(result).to.equal(true, 'clear');

            return client.registerArm(armId);
        }).then(([ result ]) => {
            expect(result).to.be.a('boolean');
            expect(result).to.equal(true, 'register_arm');

            return client.registerReward(playerId, armId, reward);
        }).then(([ result ]) => {
            expect(result).to.be.a('boolean');
            expect(result).to.equal(true, 'register_reward');

            return client.getArmInfo(playerId);
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('object');
            expect(result).to.deep.equal({ [armId]: [ 1, reward ] });
            done();
        }).catch(done);
    });
});

describe('bandit#reset', () => {
    it('reset', done => {
        const armId = 'foo';
        const playerId = 'bar';
        const reward = 1.08;
        client.clear().then(([ result ]) => {
            expect(result).to.be.a('boolean');
            expect(result).to.equal(true, 'clear');

            return client.registerArm(armId);
        }).then(([ result ]) => {
            expect(result).to.be.a('boolean');
            expect(result).to.equal(true, 'register_arm');

            return client.registerReward(playerId, armId, reward);
        }).then(([ result ]) => {
            expect(result).to.be.a('boolean');
            expect(result).to.equal(true, 'register_reward');

            return client.reset(playerId);
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean');
            expect(result).to.equal(true, 'reset');

            return client.getArmInfo(playerId);
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('object');
            expect(result).to.deep.equal({ [armId]: [ 0, 0 ] });
            done();
        }).catch(done);
    });
});