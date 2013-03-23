var msgpack = require('msgpack'),
    assert = require('assert'),
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

function Client(socket) {
    assert(socket instanceof net.Socket, 'Illegal argument');

    events.EventEmitter.call(this);

    var self = this,
        port = socket.remotePort,
        host = socket.remoteAddress,
        callbacks = {},
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
        ready = function () {
            if (self.closed) { throw new Error('closed'); }
            if (socket.destroyed) { socket.connect(port, host); }
        },
        socketEvents = [ 'connect', 'end', 'timeout', 'drain', 'error', 'close' ];

    socketEvents.forEach(function (eventName) {
        socket.on(eventName, function () {
            debug('socket event [' + eventName + ']');
            var args = [eventName].concat(Array.prototype.slice.call(arguments));
            self.emit.apply(self, args);
        });
    });
    socket.once('connect', function () {
        host = this.remoteAddress;
        port = this.remotePort;
    });
    debug({ socket: socket });

    this.closed = socket.destroyed;
    this.close = function () {
        socket.end();
        this.closed = true;
    };
    this.call = function (method, params, callback) {
        ready();
        var msgid = msgidGenerator.next(),
            request = [0, msgid, method, [].concat(params)];
        callbacks[msgid] = callback;
        send(request);
    };
    this.notify = function (method, params) {
        ready();
        send([2, method, params]);
    };
}

util.inherits(Client, events.EventEmitter);
exports.Client = Client;

exports.createClient = function (port, host, timeout) {
    debug({ port: port, host: host, timeout: timeout });
    var socket = net.connect(port, host || 'localhost');
    socket.setTimeout(timeout || 0);
    return new Client(socket);
};

function Server(server) {
    assert(server instanceof net.Server, 'Illegal argument');

    events.EventEmitter.call(this);

    var self = this;

    server.on('connection', function (socket) {
        var stream = new msgpack.Stream(socket).on('msg', function (request) {
                var type = request.shift(),
                    msgid = request.shift(),
                    method = request.shift(),
                    params = request.shift(),
                    callback = function (error, result) {
                        var response = [1, msgid, error, [].concat(result)];
                        stream.send(response);
                    };
                self.emit(method, params, callback);
            });
    });
}

util.inherits(Server, events.EventEmitter);
exports.Server = Server;

