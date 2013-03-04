var msgpack = require('msgpack'),
    net = require('net'),
    util = require('util');

var isDebugEnabled = (process.env.NODE_DEBUG && /msgpack-rpc/.test(process.env.NODE_DEBUG)),
    debug = isDebugEnabled ? function (x) { console.error('MSGPACK-RPC:', x); } : function () {};

var msgid_gen = (function () {
    var MAX = Math.pow(2, 32) - 1,
        msgid = 0;
    return {
        next: function () {
            return (msgid = (msgid < MAX ? msgid + 1 : 0));
        }
    };
}());

exports.createClient = function (portNumber, hostName) {
    debug(util.format('{ "portNumber": %j, "hostName": %j }', portNumber, hostName));
    var port = portNumber,
        host = hostName || 'localhost',
        socket = net.createConnection(port, host, function () {
            debug('connected');
            this.on('connect', function () {
                debug('reconnected');
            });
        }).on('end', function () {
            debug('disconnected');
        }),
        callbacks = {},
        stream = new msgpack.Stream(socket).on('msg', function (response) {
            if (isDebugEnabled) { debug('received message: ' + util.inspect(response, false, null, true)); }
            var type = response.shift(),
                msgid = response.shift(),
                error = response.shift(),
                result = response.shift(),
                callback = (callbacks[msgid] || function () {});
            callback(error, result, msgid);
            delete callbacks[msgid];
        });
    return {
        close: function () {
            socket.end();
            this.closed = true;
            debug('closed');
        },
        closed: false,
        call: function (method, params, callback) {
            if (this.closed) { throw new Error('closed'); }
            if (socket.destroyed) { socket.connect(port, host); }
            var msgid = msgid_gen.next(),
                request = [0, msgid, method, params];
            callbacks[msgid] = callback;
            if (isDebugEnabled) { debug('send message: ' + util.inspect(request, false, null, true)); }
            stream.send(request);
        },
        notify: function (method, params) {
            if (this.closed) { throw new Error('closed'); }
            if (socket.destroyed) { socket.connect(port, host); }
            stream.send([2, method, params]);
        }
    };
};
