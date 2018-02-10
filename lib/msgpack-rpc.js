/*
 * MessagePack-RPC Implementation
 * ==============================
 * 
 * ## MessagePack-RPC Specification ##
 * 
 * See also: 
 *  - https://github.com/msgpack-rpc/msgpack-rpc/blob/master/spec.md
 *  - http://frsyuki.hatenablog.com/entry/20100406/p1
 */

const msgpack = require('msgpack-lite'),
    debug = require('./debug')('jubatus-node-client:lib:msgpack-rpc'),
    assert = require('assert'),
    events = require('events'),
    net = require('net'),
    util = require('util');

const msgidGenerator = (function () {
    const MAX = Math.pow(2, 32) - 1;
    let msgid = 0;
    return { next() { return (msgid = (msgid < MAX ? msgid + 1 : 0)); } };
}());

function Client(port = 9199, host = 'localhost', timeout = 0, codecOptions = { encode: {}, decode: {} }) {
    events.EventEmitter.call(this);

    const self = this;
    const socketEvents = [ 'connect', 'end', 'timeout', 'drain', 'error', 'close' ];
    const encodeCodec = msgpack.createCodec((codecOptions || {}).encode);
    const decodeCodec = msgpack.createCodec((codecOptions || {}).decode);

    function send(message, callback = function () {}) {
        const socket = net.connect(port, host);
        socket.setTimeout(timeout);
        debug({ socket });

        socketEvents.forEach(eventName => {
            socket.on(eventName, (...args) => {
                debug(`socket event [${ eventName }]`);
                self.emit.apply(self, [eventName].concat(args));
            });
        });

        if (message[0] === 0) {
            socket.pipe(msgpack.createDecodeStream({ codec: decodeCodec })).on('data', message => {
                if (debug.enabled) { debug(`received message: ${ util.inspect(message, false, null, true) }`); }
    
                socket.end();
                const [ type, msgid, error, result ] = message; // Response message
                assert.equal(type, 1);
                assert.equal(msgid, message[1]);
                callback.call(self, error, result, msgid);
            });
        }
        const encodeStream = msgpack.createEncodeStream({ codec: encodeCodec });
        encodeStream.pipe(socket);
        encodeStream.write(message, (...args) => {
            if (debug.enabled) { debug(`sent message: ${ util.inspect(message, false, null, true) }`); }
            if (message[0] === 2) { callback.apply(self, args); }
        });
        encodeStream.end();
    }
    Object.defineProperty(this, 'send', {
        get() { return send; },
        enumerable: false
    });

    // It is left for compatibility with v0.6 or earlier.
    Object.defineProperty(this, 'close', {
        get() { return (() => {}); }
    });
}

function _call(type, method, params, callback) {
    const message = [ type ].concat(type === 0 ? msgidGenerator.next() : [], [ method, [].concat(params) ] );
    if (callback) {
        this.send(message, callback);
    } else {
        return new Promise((resolve, reject) => {
            this.send(message, (error, ...args) => {
                if (error) { reject(error); } else { resolve(args); }
            });
        });
    }
}

function request(method, params, callback) {
    return _call.call(this, 0, method, params, callback);
}

function notify(method, params, callback) {
    return _call.call(this, 2, method, params, callback);
}

Client.prototype.request = request;
Client.prototype.call = request; // It is left for compatibility with v0.6 or earlier.
Client.prototype.notify = notify;
util.inherits(Client, events.EventEmitter);
exports.Client = Client;

exports.createClient = function createClient(port, host, timeout, codecOptions) {
    debug({ port, host, timeout, codecOptions });
    return new Client(port, host, timeout, codecOptions);
};

exports.createServer = function createServer(options, connectionListener, codecOptions = { encode: {}, decode: {} }) {
    const encodeCodec = msgpack.createCodec((codecOptions || {}).encode);
    const decodeCodec = msgpack.createCodec((codecOptions || {}).decode);
    const server = net.createServer(options, connectionListener);
    server.on('connection', function onConnection(socket) {
        socket.pipe(msgpack.createDecodeStream({ codec: decodeCodec })).on('data', message => {
            debug(message);
            if (message[0] === 0) {
                const [ , msgid, method, params ] = message; // Request message
                server.emit(method, params, (error, result) => {
                    const encodeStream = msgpack.createEncodeStream({ codec: encodeCodec });
                    encodeStream.pipe(socket);
                    encodeStream.write([ 1, msgid, error, [].concat(result) ]); // Response message
                    encodeStream.end();                    
                });
            } else {
                const [ , method, params ] = message; // Notification message
                server.emit(method, params);
            }
        });
    });
    return server;
};