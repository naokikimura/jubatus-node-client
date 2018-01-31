/*jslint node: true, passfail: false */

const expect = require('chai').expect;
const spawn = require('child_process').spawn;
const portfinder = require('portfinder');
const debug = require('debug')('jubatus-node-client:test:clustering');
const jubatus = require('../index.js');

let server;
let client;

before(done => {
    const option = { port: Number(process.env.npm_package_config_test_port || 9199) };
    portfinder.getPortPromise(option).then(port => {
        debug(`port: ${ port }`);
        const executor = (resolve, reject) => {
            /*jslint nomen: true */
            const config = 'clustering_config.json',
                command = 'jubaclustering',
                args = ['-p', port, '-f', config],
                options = { cwd: __dirname };
            server = spawn(command, args, options);
            server.on('exit', (code, signal) => {
                debug({ code: code, signal: signal });
                if (code === null) {
                    reject(new Error(signal));
                }
            });
            server.stdout.on('data', data => {
                if (/RPC server startup/.test(data.toString())) {
                    resolve(port);
                }
            });
            if (debug.enabled) {
                server.stdout.on('data', data => {
                    process.stderr.write(data);
                });
            }
        };
        return new Promise(executor);
    }).then(port => {
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
        const variables = [ 'foo', 'bar', 'baz', 'qux', 'quux', 'quuz', 'corge', 'grault', 'garply', 'waldo', 'fred', 'plugh', 'xyzzy', 'thud' ];
        const points = [];
        for (let i = 0; i < 1000; i++) {
            const index = Math.floor(Math.random() * variables.length);
            const variable = variables[index];
            points[i] = [ '' + i, [ [ [ 'foobar', variable ] ] ] ];
        }
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
            expect(result).to.be.a('array');
            done();
        }).catch(done);
    });
});

describe('clustering#get_core_members_light', () => {
    it('get_core_members_light', done => {
        client.getCoreMembersLight().then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array');
            done();
        }).catch(done);
    });
});

describe('clustering#get_k_center', () => {
    it('get_k_center', done => {
        client.getKCenter().then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array');
            done();
        }).catch(done);
    });
});

describe('clustering#get_nearest_center', () => {
    it('get_nearest_center', done => {
        const datum = [ [ [ 'foo', 'bar' ] ] ];
        client.getNearestCenter(datum).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array');
            done();
        }).catch(done);
    });
});

describe('clustering#get_nearest_members', () => {
    it('get_nearest_members', done => {
        const datum = [ [ [ 'foo', 'bar' ] ] ];
        client.getNearestMembers(datum).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array');
            done();
        }).catch(done);
    });
});

describe('clustering#get_nearest_members_light', () => {
    it('get_nearest_members_light', done => {
        const datum = [ [ [ 'foo', 'bar' ] ] ];
        client.getNearestMembersLight(datum).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array');
            done();
        }).catch(done);
    });
});