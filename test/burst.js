/*jslint node: true, passfail: false */

const expect = require('chai').expect;
const debug = require('debug')('jubatus-node-client:test:burst');
const testUtil = require('./util');
const jubatus = require('../index.js');

let server;
let client;

before(done => {
    const command = 'jubaburst', config = 'burst_config.json';
    testUtil.createServerProcess(command, config).then(([ port, serverProcess ]) => {
        server = serverProcess;
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
        const keywordParams  = new jubatus.burst.types.KeywordWithParams(keyword, 1.2, 0.3);
        const document = new jubatus.burst.types.Document(1.2, 'foobar');
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
            expect(result).to.be.a('Window')
                .and.to.deep.equal(jubatus.burst.types.Window.fromTuple([ -20, [ [ 0, 0, 0 ], [ 0, 0, 0 ], [ 3, 1, 0 ], [ 0, 0, 0 ], [ 0, 0, 0 ] ] ]));
            done();
        }).catch(done);
    });
});

describe('burst#get_result_at', () => {
    it('get_result_at', done => {
        const keyword = 'foo';
        const keywordParams = new jubatus.burst.types.KeywordWithParams(keyword, 1.001, 0.001);
        const documents = [
            new jubatus.burst.types.Document(0, 'foo'),
            new jubatus.burst.types.Document(3, 'bar'),
            new jubatus.burst.types.Document(6, 'baz')
        ];
        client.clear().then(([ result ]) => {
            expect(result).to.equal(true);

            return client.addKeyword(keywordParams);
        }).then(([ result ]) => {
            expect(result).to.equal(true);

            return client.addDocuments(documents);
        }).then(([ result ]) => {
            expect(result).to.equal(3);

            return client.getResultAt(keyword, 0);
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('Window')
                .and.to.deep.equal(jubatus.burst.types.Window.fromTuple([ -20, [ [ 0, 0, 0 ], [ 0, 0, 0 ], [ 3, 1, 0 ], [ 0, 0, 0 ], [ 0, 0, 0 ] ] ]));
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
        const keyword = jubatus.burst.types.KeywordWithParams.fromTuple([ 'foo', 1.2, 0.3 ]);
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
        const keywordParams  = jubatus.burst.types.KeywordWithParams.fromTuple([ keyword, 1.2, 0.3 ]);
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
        const keywordParams  = jubatus.burst.types.KeywordWithParams.fromTuple([ keyword, 1.2, 0.3 ]);
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