/*jslint node: true, passfail: false */

const expect = require('chai').expect;
const spawn = require('child_process').spawn;
const portfinder = require('portfinder');
const debug = require('debug')('jubatus-node-client:test:burst');
const jubatus = require('../index.js');

let server;
let client;

before(done => {
    const option = { port: Number(process.env.npm_package_config_test_port || 9199) };
    portfinder.getPortPromise(option).then(port => {
        debug(`port: ${ port }`);
        const executor = (resolve, reject) => {
            /*jslint nomen: true */
            const config = 'burst_config.json',
                command = 'jubaburst',
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
        client = new jubatus.burst.client.Burst(port, 'localhost');
        done();
    }).catch(done);
});

after(done => {
    client.getClient().close();
    server.kill();
    done();
});

describe('burst#add_documents', () => {
    it('add_documents', done => {
        const keyword = 'foo';
        const keywordParams  = [ keyword, 1.2, 0.3 ];
        const document = [ 1.2, 'foobar' ];
        const documents = [ document ];
        client.clear().then(([ result ]) => {
            expect(result).to.equal(true);
            
            return client.addKeyword(keywordParams);
        }).then(([ result ]) => {
            expect(result).to.equal(true);

            return client.addDocuments(documents);
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('number');
            expect(result).to.equal(1);
            done();
        }).catch(done);
    });
});

describe('burst#get_result', () => {
    it('get_result', done => {
        const keyword = 'foo';
        const keywordParams  = [ keyword, 1.001, 0.001 ];
        const documents = [ [ 0, 'foo' ], [ 0, 'bar' ], [ 0, 'baz' ] ];
        client.clear().then(([ result ]) => {
            expect(result).to.equal(true);

            return client.addKeyword(keywordParams);
        }).then(([ result ]) => {
            expect(result).to.equal(true);

            return client.addDocuments(documents);
        }).then(([ result ]) => {
            expect(result).to.equal(3);

            return client.getResult(keyword);
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array');
            expect(result).to.deep.equal([ -20, [ [ 0, 0, 0 ], [ 0, 0, 0 ], [ 3, 1, 0 ], [ 0, 0, 0 ], [ 0, 0, 0 ] ] ]);
            done();
        }).catch(done);
    });
});

describe('burst#get_all_bursted_results', () => {
    it('get_all_bursted_results', done => {
        const keyword = 'foo';
        const keywordParams  = [ keyword, 1.001, 0.001 ];
        const documents = [ [ 0, 'foo' ], [ 1, 'bar' ], [ 2, 'baz' ] ];
        client.clear().then(([ result ]) => {
            expect(result).to.equal(true);

            return client.addKeyword(keywordParams);
        }).then(([ result ]) => {
            expect(result).to.equal(true);

            return client.addDocuments(documents);
        }).then(([ result ]) => {
            expect(result).to.equal(3);

            return client.getAllBurstedResults();
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('object');
            expect(result).to.deep.equal({});
            done();
        }).catch(done);
    });
});

describe('burst#get_all_bursted_results_at', () => {
    it('get_all_bursted_results_at', done => {
        const pos = 0;
        client.clear().then(([ result ]) => {
            expect(result).to.equal(true);

            return client.getAllBurstedResultsAt(pos);
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('object');
            expect(result).to.deep.equal({});
            done();
        }).catch(done);
    });
});

describe('burst#get_all_keywords', () => {
    it('get_all_keywords', done => {
        const keyword = [ 'foo', 1.2, 0.3 ];
        client.clear().then(([ result ]) => {
            expect(result).to.equal(true);

            return client.getAllKeywords();
        }).then(([ result ]) => {
            expect(result).to.be.a('array');
            expect(result).to.deep.equal([]);

            return client.addKeyword(keyword);
        }).then(([ result ]) => {
            expect(result).to.equal(true);

            return client.getAllKeywords();
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array');
            expect(result).to.deep.equal([ keyword ]);
            done();
        }).catch(done);
    });
});

describe('burst#add_keyword', () => {
    it('add_keyword', done => {
        const keyword = [ 'foo', 1.2, 0.3 ];
        client.clear().then(([ result ]) => {
            expect(result).to.equal(true);

            return client.addKeyword(keyword);
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean');
            expect(result).to.equal(true);
            done();
        }).catch(done);
    });
});

describe('burst#remove_keyword', () => {
    it('remove_keyword', done => {
        const keyword = 'foo';
        const keywordParams  = [ keyword, 1.2, 0.3 ];
        client.clear().then(([ result ]) => {
            expect(result).to.equal(true);

            return client.addKeyword(keywordParams);
        }).then(([ result ]) => {
            expect(result).to.equal(true);

            return client.getAllKeywords();
        }).then(([ result ]) => {
            expect(result).to.be.a('array');
            expect(result).to.deep.equal([ keywordParams ]);

            return client.removeKeyword(keyword);
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean');
            expect(result).to.equal(true);
            done();
        }).catch(done);
    });
});

describe('burst#remove_all_keywords', () => {
    it('remove_all_keywords', done => {
        const keyword = 'foo';
        const keywordParams  = [ keyword, 1.2, 0.3 ];
        client.clear().then(([ result ]) => {
            expect(result).to.equal(true);

            return client.addKeyword(keywordParams);
        }).then(([ result ]) => {
            expect(result).to.equal(true);

            return client.getAllKeywords();
        }).then(([ result ]) => {
            expect(result).to.be.a('array');
            expect(result).to.deep.equal([ keywordParams ]);

            return client.removeAllKeywords();
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean');
            expect(result).to.equal(true);
            done();
        }).catch(done);
    });
});