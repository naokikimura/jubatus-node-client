var msgpack = require('msgpack'),
    net = require('net'),
    events = require('events'),
    util = require('util');

var isDebugEnabled = (process.env.NODE_DEBUG && /msgpack-rpc/.test(process.env.NODE_DEBUG)),
    debug = isDebugEnabled ? function (x) { console.error('MSGPACK-RPC:', x); } : function () {};

var msgidGenerator = (function () {
    var MAX = Math.pow(2, 32) - 1,
        msgid = 0;
    return {
        next: function () {
            return (msgid = (msgid < MAX ? msgid + 1 : 0));
        }
    };
}());

function Client(port, host, timeout) {
    events.EventEmitter.call(this);

    var self = this,
        callbacks = {},
        socket = net.createConnection(port, host),
        receive = function (response) {
            if (isDebugEnabled) { debug('received message: ' + util.inspect(response, false, null, true)); }

            var type = response.shift(),
                msgid = response.shift(),
                error = response.shift(),
                result = response.shift(),
                callback = (callbacks[msgid] || function () {});
            callback(error, result, msgid);
            delete callbacks[msgid];
        },
        stream = new msgpack.Stream(socket).on('msg', receive),
        send = function (request) {
            return stream.send(request, function () {
                if (isDebugEnabled) { debug('sent message: ' + util.inspect(request, false, null, true)); }
            });
        },
        socketEvents = [ 'connect', 'end', 'timeout', 'drain', 'error', 'close' ];

    socketEvents.forEach(function (eventName) {
        socket.on(eventName, function () {
            debug('socket event [' + eventName + ']');
            var args = [eventName].concat(Array.prototype.slice.call(arguments));
            self.emit.apply(self, args);
        });
    });
    socket.setTimeout(timeout);

    this.closed = false;
    this.close = function () {
        socket.end();
        this.closed = true;
    };
    this.call = function (method, params, callback) {
        if (this.closed) { throw new Error('closed'); }
        if (socket.destroyed) { socket.connect(port, host); }

        var msgid = msgidGenerator.next(),
            request = [0, msgid, method, [].concat(params)];
        callbacks[msgid] = callback;
        send(request);
    };
    this.notify = function (method, params) {
        if (this.closed) { throw new Error('closed'); }
        if (socket.destroyed) { socket.connect(port, host); }

        send([2, method, params]);
    };
}

util.inherits(Client, events.EventEmitter);

exports.createClient = function (port, host, timeout) {
    debug({ port: port, host: host, timeout: timeout });
    return new Client(port, host || 'localhost', timeout || 0);
};
