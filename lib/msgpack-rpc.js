var msgpack = require('msgpack')
  , net = require('net')
  , util = require('util')

var enablesDebug = (process.env.NODE_DEBUG && /msgpack-rpc/.test(process.env.NODE_DEBUG))
  , debug = enablesDebug ? function(x) { console.error('MSGPACK-RPC:', x); } : function() {}

var msgid_gen = (function() {
    var MAX = Math.pow(2, 32) - 1
      , msgid = 0;
    return {
        next: function() {
            return (msgid = (msgid < MAX ? msgid + 1 : 0))
        }
    }
})()

exports.createClient = function() {
    debug(util.format('{ "port": "%j", "host": "%j" }', arguments[0], arguments[1]))
    var port = arguments[0]
      , host = arguments[1] || 'localhost'
      , socket = net.createConnection(port, host, function() {
            debug('connected');
            this.on('connect', function() {
                debug('reconnected');
            })
        }).on('end', function() {
            debug('disconnected');
        })
      , stream = new msgpack.Stream(socket).on('msg', function(response) {
            if (enablesDebug) debug('received message: ' + util.inspect(response, false, null, true));
            var type = response.shift()
              , msgid = response.shift()
              , error = response.shift()
              , result = response.shift()
              , callback = (callbacks[msgid] || function() {})
            callback(error, result, msgid)
            delete callbacks[msgid]
        })
      , callbacks = {}
    return {
        close: function() {
            socket.end();
            this.closed = true;
            debug('closed');
        }
      , closed: false
      , call: function(method, params, callback) {
            if (this.closed) throw new Error('closed');
            if (socket.destroyed) socket.connect(port, host)
            var msgid = msgid_gen.next()
            callbacks[msgid] = callback;
            var request = [0, msgid, method, params]
            if (enablesDebug) debug('send message: ' + util.inspect(request, false, null, true));
            stream.send(request);
        }
      , notify: function(method, params) {
            if (this.closed) throw new Error('closed');
            if (socket.destroyed) socket.connect(port, host)
            stream.send([2, method, params]);
        }
    }
}
