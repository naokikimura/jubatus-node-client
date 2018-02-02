const expect = require('chai').expect;
const portfinder = require('portfinder');
const debug = require('debug')('jubatus-node-client:test:msgpack-rpc');
const rpc = require('../lib/msgpack-rpc');

describe('msgpack-rpc', () => {

  const option = { port: Number(process.env.npm_package_config_test_port || 9199) };
  let server;
  let client;

  afterEach(done => {
    client && client.close();
    client = null;
    server && server.close();
    server = null;
    done();
  });

  it('msgpack-rpc#call', done => {
    portfinder.getPortPromise(option).then(port => {
      debug({ port });

      server = rpc.createServer().on('foo', (params, callback) => {
        expect(params).to.have.ordered.members([ 1, 2, 3 ]);
        callback(null, 'bar');
      });
      server.listen(port);

      client = rpc.createClient(port);
      client.call('foo', [ 1, 2, 3], (error, response) => {
        expect(response).to.have.ordered.members([ 'bar' ]);
        done();
      });
    }).catch(done);
  });

  it('msgpack-rpc#notify', done => {
    portfinder.getPortPromise(option).then(port => {
      debug({ port });

      server = rpc.createServer().on('qux', (params) => {
        expect(params).to.have.ordered.members([ 1, 2, 3 ]);
        done();
      });
      server.listen(port);

      client = rpc.createClient(port);
      client.notify('qux', [ 1, 2, 3]);
    }).catch(done);
  });

});
