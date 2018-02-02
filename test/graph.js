/*jslint node: true, passfail: false */

const expect = require('chai').expect;
const debug = require('debug')('jubatus-node-client:test:graph');
const testUtil = require('./util');
const jubatus = require('../index.js');

let server;
let client;

before(done => {
    const command = 'jubagraph', config = 'graph_config.json';
    testUtil.createServerProcess(command, config).then(([ port, serverProcess ]) => {
        server = serverProcess;
        client = new jubatus.graph.client.Graph(port, 'localhost');
        done();
    }).catch(done);
});

after(done => {
    client.getClient().close();
    server.kill();
    done();
});

describe('graph#create_node', () => {
    it('create_node', done => {
        client.createNode().then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('string');
            done();
        }).catch(done);
    });
});

describe('graph#remove_node', () => {
    it('remove_node', done => {
        client.createNode().then(([ result ]) => {
            expect(result).to.be.a('string');
            return client.removeNode(result);
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean').and.to.equal(true);
            done();
        }).catch(done);
    });
});

describe('graph#update_node', () => {
    it('update_node', done => {
        const property = { 'foo': 'bar' };
        client.createNode().then(([ nodeId ]) => {
            expect(nodeId).to.be.a('string');
            return client.updateNode(nodeId, property);
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean').and.to.equal(true);
            done();
        }).catch(done);
    });
});

describe('graph#create_edge', () => {
    it('create_edge', done => {
        const property = { 'foo': 'bar' };
        const edge = [ property , null, null ];
        client.createNode().then(([ source ]) => {
            expect(source).to.be.a('string');
            edge[1] = source;
            return client.createNode();
        }).then(([ target ]) => {
            expect(target).to.be.a('string');
            edge[2] = target;
            return client.createEdge(edge[1], edge);
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('number');
            done();
        }).catch(done);
    });
});

describe('graph#update_edge', () => {
    it('update_edge', done => {
        const property = { 'foo': 'bar' };
        const edge = [ property , null, null ];
        client.createNode().then(([ source ]) => {
            expect(source).to.be.a('string');
            edge[1] = source;
            return client.createNode();
        }).then(([ target ]) => {
            expect(target).to.be.a('string');
            edge[2] = target;
            return client.createEdge(edge[1], edge);
        }).then(([ edgeId ]) => {
            expect(edgeId).to.be.a('number');
            return client.updateEdge(edge[1], edgeId, edge);            
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean').and.to.equal(true);
            done();
        }).catch(done);
    });
});

describe('graph#get_centrality', () => {
    it('get_centrality', done => {
        let nodeIds = [];
        let edgeIds = [];
        let query = [];
        Promise.all([
            client.createNode(),
            client.createNode(),
            client.createNode(),
            client.createNode()
        ]).then(nodes => {
            debug(nodes);
            nodeIds = nodes.map(node => node[0]);
            return Promise.all([
                client.createEdge(nodeIds[0], [ { 'foobar': 'foo' }, nodeIds[0], nodeIds[1] ]),
                client.createEdge(nodeIds[1], [ { 'foobar': 'bar' }, nodeIds[1], nodeIds[2] ]),
                client.createEdge(nodeIds[2], [ { 'foobar': 'baz' }, nodeIds[2], nodeIds[0] ]),
                client.createEdge(nodeIds[3], [ { 'foobar': 'qux' }, nodeIds[0], nodeIds[3] ]),
                client.createEdge(nodeIds[3], [ { 'foobar': 'quux' }, nodeIds[1], nodeIds[3] ]),
                client.createEdge(nodeIds[3], [ { 'foobar': 'quuz' }, nodeIds[2], nodeIds[3] ])
            ]);
        }).then(edges => {
            debug(edges);
            edgeIds = edges.map(edge => edge[0]);
            const edgeQuery = [];
            const nodeQuery = [];
            query = [ edgeQuery, nodeQuery ];
            return client.addCentralityQuery(query);
        }).then(([ result ]) => {
            expect(result).to.be.a('boolean').and.to.equal(true);
            return client.updateIndex();
        }).then(([ result ]) => {
            expect(result).to.be.a('boolean').and.to.equal(true);
            return client.getCentrality(nodeIds[3], 0, query);
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('number').and.to.equal(1);
            done();
        }).catch(done);
    });
});

describe('graph#add_centrality_query', () => {
    it('add_centrality_query', done => {
        const edgeQuery = [ [ '', '' ] ];
        const nodeQuery = [ [ '', '' ] ];
        const query = [ edgeQuery, nodeQuery ];
        client.addCentralityQuery(query).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean').and.to.equal(true);
            done();
        }).catch(done);
    });
});

describe('graph#add_shortest_path_query', () => {
    it('add_shortest_path_query', done => {
        const edgeQuery = [ [ '', '' ] ];
        const nodeQuery = [ [ '', '' ] ];
        const query = [ edgeQuery, nodeQuery ];
        client.addShortestPathQuery(query).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean').and.to.equal(true);
            done();
        }).catch(done);
    });
});

describe('graph#remove_centrality_query', () => {
    it('remove_centrality_query', done => {
        const edgeQuery = [ [ '', '' ] ];
        const nodeQuery = [ [ '', '' ] ];
        const query = [ edgeQuery, nodeQuery ];
        client.addCentralityQuery(query).then(([ result ]) => {
            expect(result).to.be.a('boolean').and.to.equal(true);
            return client.removeCentralityQuery(query);
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean').and.to.equal(true);
            done();
        }).catch(done);
    });
});

describe('graph#remove_shortest_path_query', () => {
    it('remove_shortest_path_query', done => {
        const edgeQuery = [ [ '', '' ] ];
        const nodeQuery = [ [ '', '' ] ];
        const query = [ edgeQuery, nodeQuery ];
        client.addShortestPathQuery(query).then(([ result ]) => {
            expect(result).to.be.a('boolean').and.to.equal(true);
            return client.removeShortestPathQuery(query);
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean').and.to.equal(true);
            done();
        }).catch(done);
    });
});

describe('graph#get_shortest_path', () => {
    it('get_shortest_path', done => {
        let nodeIds = [];
        let edgeIds = [];
        let query = [];
        Promise.all([
            client.createNode(),
            client.createNode(),
            client.createNode(),
            client.createNode()
        ]).then(nodes => {
            debug(nodes);
            nodeIds = nodes.map(node => node[0]);
            return Promise.all([
                client.createEdge(nodeIds[0], [ { 'foobar': 'foo' }, nodeIds[0], nodeIds[1] ]),
                client.createEdge(nodeIds[1], [ { 'foobar': 'bar' }, nodeIds[1], nodeIds[2] ]),
                client.createEdge(nodeIds[2], [ { 'foobar': 'baz' }, nodeIds[2], nodeIds[3] ]),
                client.createEdge(nodeIds[3], [ { 'foobar': 'qux' }, nodeIds[3], nodeIds[0] ])
            ]);
        }).then(edges => {
            debug(edges);
            edgeIds = edges.map(edge => edge[0]);
            const edgeQuery = [];
            const nodeQuery = [];
            query = [ edgeQuery, nodeQuery ];
            return client.addShortestPathQuery(query);
        }).then(([ result ]) => {
            expect(result).to.be.a('boolean').and.to.equal(true);
            return client.updateIndex();
        }).then(([ result ]) => {
            expect(result).to.be.a('boolean').and.to.equal(true);
            const shortestPathQuery = [ nodeIds[0], nodeIds[3], 4, query ];
            debug(shortestPathQuery);
            return client.getShortestPath(shortestPathQuery);
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array');
            done();
        }).catch(done);
    });
});

describe('graph#update_index', () => {
    it('update_index', done => {
        client.updateIndex().then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('boolean').and.to.equal(true);
            done();
        }).catch(done);
    });
});

describe('graph#get_node', () => {
    it('get_node', done => {
        client.createNode().then(([ nodeId ]) => {
            expect(nodeId).to.be.a('string');
            return client.getNode(nodeId);
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array').and.to.have.deep.members([ {}, [], []]);
            done();
        }).catch(done);
    });
});

describe('graph#get_edge', () => {
    it('get_edge', done => {
        const property = { 'foo': 'bar' };
        const edge = [ property , null, null ];
        client.createNode().then(([ source ]) => {
            expect(source).to.be.a('string');
            edge[1] = source;
            return client.createNode();
        }).then(([ target ]) => {
            expect(target).to.be.a('string');
            edge[2] = target;
            return client.createEdge(edge[1], edge);
        }).then(([ edgeId ]) => {
            expect(edgeId).to.be.a('number');
            return client.getEdge(edge[1], edgeId);            
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array').and.to.have.deep.members(edge);
            done();
        }).catch(done);
    });
});

describe('graph#get_edge', () => {
    it('get_edge', done => {
        const property = { 'foo': 'bar' };
        const edge = [ property , null, null ];
        client.createNode().then(([ source ]) => {
            expect(source).to.be.a('string');
            edge[1] = source;
            return client.createNode();
        }).then(([ target ]) => {
            expect(target).to.be.a('string');
            edge[2] = target;
            return client.createEdge(edge[1], edge);
        }).then(([ edgeId ]) => {
            expect(edgeId).to.be.a('number');
            return client.getEdge(edge[1], edgeId);            
        }).then(([ result ]) => {
            debug(result);
            expect(result).to.be.a('array').and.to.have.deep.members(edge);
            done();
        }).catch(done);
    });
});