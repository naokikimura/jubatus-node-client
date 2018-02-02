const msgpack = require('msgpack-js'),
    Stream = require('msgpack').Stream,
    debug = require('./debug')('jubatus:lib:msgpack-rpc'),
    assert = require('assert'),
    net = require('net'),
    events = require('events'),
    util = require('util');

const msgidGenerator = (function () {
    const MAX = Math.pow(2, 32) - 1;
    let msgid = 0;
    return {
        next() {
            return (msgid = (msgid < MAX ? msgid + 1 : 0));
        }
    };
}());

function Client(socket) {
    assert(socket instanceof net.Socket, 'Illegal argument');

    events.EventEmitter.call(this);

    let callbacks = {},
        port = socket.remotePort,
        host = socket.remoteAddress;
    const self = this,
        receive = function receive(response) {
            if (debug.enabled) { debug(`received message: ${ util.inspect(response, false, null, true) }`); }

            const [ type, msgid, error, result ] = response,
                callback = (callbacks[msgid] || function () {});
            callback.call(self, error, result, msgid);
            delete callbacks[msgid];
        },
        stream = new Stream(socket).on('msg', receive),
        send = function send(request) {
            const buf = msgpack.encode(request);
            return socket.write(buf, function () {
                if (debug.enabled) { debug(`sent message: ${ util.inspect(request, false, null, true) }`); }
            });
        },
        ready = function ready() {
            if (self.closed) { throw new Error('closed'); }
            if (socket.destroyed) { socket.connect(port, host); }
        },
        socketEvents = [ 'connect', 'end', 'timeout', 'drain', 'error', 'close' ];

    socketEvents.forEach(function (eventName) {
        socket.on(eventName, function () {
            debug(`socket event [${ eventName }]`);
            const args = [eventName].concat(Array.prototype.slice.call(arguments));
            self.emit.apply(self, args);
        });
    });
    socket.once('connect', function onConnect() {
        host = this.remoteAddress;
        port = this.remotePort;
    });
    debug({ socket });

    this.closed = socket.destroyed;
    this.close = function close() {
        socket.end();
        this.closed = true;
    };
    this.call = function call(method, params, callback) {
        ready();
        const msgid = msgidGenerator.next(),
            request = [0, msgid, method, [].concat(params)];
        callbacks[msgid] = callback;
        send(request);
    };
    this.notify = function notify(method, params) {
        ready();
        send([2, method, params]);
    };
}

util.inherits(Client, events.EventEmitter);
exports.Client = Client;

exports.createClient = function createClient(port, host, timeout) {
    debug({ port, host, timeout });
    const socket = net.connect(port, host || 'localhost');
    socket.setTimeout(timeout || 0);
    return new Client(socket);
};

function Server(server) {
    assert(server instanceof net.Server, 'Illegal argument');

    events.EventEmitter.call(this);

    const self = this;

    server.on('connection', function onConnection(socket) {
        const stream = new Stream(socket).on('msg', function onMsg(request) {
                const [ type, msgid, method, params ] = request,
                    callback = (error, result) => {
                        const response = [1, msgid, error, [].concat(result)],
                            buf = msgpack.encode(response);
                        socket.write(buf);
                    };
                self.emit(method, params, callback);
            });
    });
}

util.inherits(Server, events.EventEmitter);
exports.Server = Server;