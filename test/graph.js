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
        client.createNode().then(result => {
            debug(result);
            expect(result).to.be.a('string');
            done();
        }).catch(done);
    });
});

describe('graph#remove_node', () => {
    it('remove_node', done => {
        client.createNode().then(result => {
            expect(result).to.be.a('string');
            return client.removeNode(result);
        }).then(result => {
            debug(result);
            expect(result).to.be.a('boolean').and.to.equal(true);
            done();
        }).catch(done);
    });
});

describe('graph#update_node', () => {
    it('update_node', done => {
        const property = { 'foo': 'bar' };
        client.createNode().then(nodeId => {
            expect(nodeId).to.be.a('string');
            return client.updateNode(nodeId, property);
        }).then(result => {
            debug(result);
            expect(result).to.be.a('boolean').and.to.equal(true);
            done();
        }).catch(done);
    });
});

describe('graph#create_edge', () => {
    it('create_edge', done => {
        const property = { 'foo': 'bar' };
        client.createNode().then(source => {
            expect(source).to.be.a('string');
            return client.createNode().then(target => ([source, target]));
        }).then(([source, target]) => {
            expect(target).to.be.a('string');
            const edge = new jubatus.graph.types.Edge(property, source, target);
            return client.createEdge(edge.source, edge);
        }).then(result => {
            debug(result);
            expect(result).to.be.a('number');
            done();
        }).catch(done);
    });
});

describe('graph#update_edge', () => {
    it('update_edge', done => {
        client.createNode().then(source => {
            expect(source).to.be.a('string');
            return client.createNode().then(target => ([source, target]));
        }).then(([source, target]) => {
            expect(target).to.be.a('string');
            const property = { 'foo': 'bar' };
            const edge = new jubatus.graph.types.Edge(property, source, target);
            return client.createEdge(edge.source, edge).then(edgeId => ([edgeId, edge]));
        }).then(([ edgeId, edge ]) => {
            expect(edgeId).to.be.a('number');
            return client.updateEdge(edge.source, edgeId, edge);            
        }).then(result => {
            debug(result);
            expect(result).to.be.a('boolean').and.to.equal(true);
            done();
        }).catch(done);
    });
});

describe('graph#remove_edge', () => {
    it('remove_edge', done => {
        client.createNode().then(source => {
            expect(source).to.be.a('string');
            return client.createNode().then(target => ([source, target]));
        }).then(([source, target]) => {
            expect(target).to.be.a('string');
            const property = { 'foo': 'bar' };
            const edge = new jubatus.graph.types.Edge(property , source, target);
            return client.createEdge(edge.source, edge).then(edgeId => ([edgeId, edge]));
        }).then(([edgeId, edge]) => {
            expect(edgeId).to.be.a('number');
            return client.removeEdge(edge.source, edgeId);            
        }).then(result => {
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
        let presetQuery;
        Promise.all([
            client.createNode(),
            client.createNode(),
            client.createNode(),
            client.createNode()
        ]).then(nodes => {
            debug(nodes);
            nodeIds = nodes;
            return Promise.all([
                client.createEdge(nodeIds[0], [ { 'foobar': 'foo' }, nodeIds[0], nodeIds[1] ]),
                client.createEdge(nodeIds[1], [ { 'foobar': 'bar' }, nodeIds[1], nodeIds[2] ]),
                client.createEdge(nodeIds[2], [ { 'foobar': 'baz' }, nodeIds[2], nodeIds[0] ]),
                client.createEdge(nodeIds[3], [ { 'foobar': 'qux' }, nodeIds[0], nodeIds[3] ]),
                client.createEdge(nodeIds[3], [ { 'foobar': 'quux' }, nodeIds[1], nodeIds[3] ]),
                client.createEdge(nodeIds[3], [ { 'foobar': 'quuz' }, nodeIds[2], nodeIds[3] ])
            ]);
        }).then(results => {
            edgeIds = results.map(result => result ? result.toString() : result);
            debug(edgeIds);
            presetQuery = new jubatus.graph.types.PresetQuery([], []);
            return client.addCentralityQuery(presetQuery);
        }).then(result => {
            expect(result).to.be.a('boolean').and.to.equal(true);
            return client.updateIndex();
        }).then(result => {
            expect(result).to.be.a('boolean').and.to.equal(true);
            return client.getCentrality(nodeIds[3], 0, presetQuery);
        }).then(result => {
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
        client.addCentralityQuery(query).then(result => {
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
        client.addShortestPathQuery(query).then(result => {
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
        client.addCentralityQuery(query).then(result => {
            expect(result).to.be.a('boolean').and.to.equal(true);
            return client.removeCentralityQuery(query);
        }).then(result => {
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
        client.addShortestPathQuery(query).then(result => {
            expect(result).to.be.a('boolean').and.to.equal(true);
            return client.removeShortestPathQuery(query);
        }).then(result => {
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
        const edgeQuery = new jubatus.graph.types.Query('', '');
        const nodeQuery = new jubatus.graph.types.Query('', '');
        const presetQuery = new jubatus.graph.types.PresetQuery([ edgeQuery ], [ nodeQuery ]);
        Promise.all([
            client.createNode(),
            client.createNode(),
            client.createNode(),
            client.createNode()
        ]).then(results => {
            nodeIds = results;
            debug(nodeIds);
            return Promise.all([
                client.createEdge(nodeIds[0], [ { 'foobar': 'foo' }, nodeIds[0], nodeIds[1] ]),
                client.createEdge(nodeIds[1], [ { 'foobar': 'bar' }, nodeIds[1], nodeIds[2] ]),
                client.createEdge(nodeIds[2], [ { 'foobar': 'baz' }, nodeIds[2], nodeIds[3] ]),
                client.createEdge(nodeIds[3], [ { 'foobar': 'qux' }, nodeIds[3], nodeIds[0] ])
            ]);
        }).then(results => {
            edgeIds = results.map(edgeId => edgeId);
            debug(edgeIds);
            return client.addShortestPathQuery(presetQuery);
        }).then(result => {
            expect(result).to.be.a('boolean').and.to.equal(true);
            return client.updateIndex();
        }).then(result => {
            expect(result).to.be.a('boolean').and.to.equal(true);
            const shortestPathQuery = new jubatus.graph.types.ShortestPathQuery(nodeIds[0], nodeIds[3], 4, presetQuery);
            debug(shortestPathQuery);
            return client.getShortestPath(shortestPathQuery);
        }).then(result => {
            debug(result);
            expect(result).to.be.a('array');
            done();
        }).catch(done);
    });
});

describe('graph#update_index', () => {
    it('update_index', done => {
        client.updateIndex().then(result => {
            debug(result);
            expect(result).to.be.a('boolean').and.to.equal(true);
            done();
        }).catch(done);
    });
});

describe('graph#get_node', () => {
    it('get_node', done => {
        const nodeProperty = { 'qux': 'quux', 'foo': 'bar' };
        client.createNode().then(source => {
            expect(source).to.be.a('string');
            return client.updateNode(source, nodeProperty).then(successful => {
                expect(successful).to.be.a('boolean').and.to.equal(true);
                return source;
            });
        }).then(source => {
            return client.createNode().then(target => ([ source, target ]));
        }).then(([ source, target ]) => {
            expect(target).to.be.a('string');
            const property = { 'foo': 'bar' };
            const edge = jubatus.graph.types.Edge.fromTuple([ property, source, target ]);
            return client.createEdge(source, edge).then(edgeId => ({ edgeId, edge }));
        }).then(({ edgeId, edge }) => {
            expect(edgeId).to.be.a('number').and.to.equal(32);
            return client.getNode(edge.source).then(node => ({ node, edgeId }));
        }).then(({ node, edgeId }) => {
            debug(node);
            expect(node).to.be.a('Node')
                .and.to.deep.equal(jubatus.graph.types.Node.fromTuple([nodeProperty, [], [edgeId]]));
            done();
        }).catch(done);
    });
});

describe('graph#get_edge', () => {
    it('get_edge', done => {
        client.createNode().then(source => {
            expect(source).to.be.a('string');
            return client.createNode().then(target => ([ source, target ]));
        }).then(([ source, target ]) => {
            expect(target).to.be.a('string');
            const property = { 'foo': 'bar' };
            const edge = new jubatus.graph.types.Edge(property, source, target);
            return client.createEdge(source, edge).then(edgeId => ({ edgeId, edge }));
        }).then(({ edgeId, edge }) => {
            expect(edgeId).to.be.a('number');
            return client.getEdge(edge.source, edgeId).then(result => ({ actual: result, expected: edge }));            
        }).then(({ actual, expected }) => {
            debug(actual);
            expect(actual).to.be.a('Edge').and.to.deep.equal(expected);
            done();
        }).catch(done);
    });
});