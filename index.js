/*jslint node: true */

var assert = require('assert'),
    util = require('util'),
    validate = require('json-schema').validate,
    api = require('./api'),
    rpc = require('./lib/msgpack-rpc');

exports.msgpack = require('msgpack-js');

var isDebugEnabled = process.env.NODE_DEBUG && (/jubatus/).test(process.env.NODE_DEBUG),
    isProduct = process.env.NODE_ENV && (/production/).test(process.env.NODE_ENV),
    debug = isDebugEnabled ? function (x) { console.error('JUBATUS:', x); } : function () {};

function toArray(args) {
    return Array.prototype.slice.call(args);
}

function camelCase(input) {
    return input.toLowerCase().replace(/_(.)/g, function(match, group1) {
        return group1.toUpperCase();
    });
}

function createConstructor(className) {
    var constructor = function constructor(port = 9199, host = 'localhost', name = 'cluster', timeoutSeconds = 0) {
        if (!(this instanceof constructor)) {
            throw new Error(className + ' is constructor.');
        }

        const client = rpc.createClient(port, host, timeoutSeconds * 1000);

        Object.defineProperty(this, 'client', {
            get: function() { return client; }
        });
        Object.defineProperty(this, 'name', {
            get: function() { return name; },
            set: function(value) { name = value; }
        });
        return this;
    };

    // This is not an RPC method.
    constructor.prototype.getClient = function () {
        return this.client;
    }

    // This is not an RPC method.
    constructor.prototype.getName = function () {
        return this.name;
    }

    // This is not an RPC method.
    constructor.prototype.setName = function (value) {
        this.name = value;
    }

    return api[className].methods.map(method => {
        debug(method);
        var rpcName = method.id || method,
            methodName = camelCase(rpcName),
            properties = method.properties || {},
            assertParams = !isProduct && properties.args ? params => {
                debug({ params: params, args: properties.args });
                var schema = method.args,
                    result = validate(params, schema);
                assert.ok(result.valid, util.format('%j', result.errors));
            } : () => {},
            assertReturn = !isProduct && properties.return ? returnValue => {
                debug({ result: returnValue, 'return': properties.return });
                var schema = method.return,
                    result = validate(returnValue, schema);
                assert.ok(result.valid, util.format('%j', result.errors));
            } : () => {};
      return [ rpcName, methodName, assertParams, assertReturn, properties ];
    })
    .reduce((constructor, [ rpcName, methodName, assertParams, assertReturn, properties ]) => {
        constructor.prototype[methodName] = function () {
            var self = this,
                client = self.getClient(),
                params = toArray(arguments),
                hasCallback = (typeof params[params.length - 1] === 'function');
            assertParams(params);
            params.unshift(self.getName());
            if (hasCallback) {
                let callback = params.pop();
                client.call(rpcName, params, (error, result, msgid) => {
                    if (error)
                        callback.call(self, new Error(`${ error } ${ result || '' }`), null, msgid);
                    else {
                        assertReturn(result);
                        callback.call(self, null, result, msgid);
                    }
                });
            } else {
                return new Promise((resolve, reject) => {
                    client.call(rpcName, params, (error, result, msgid) => {
                        if (error)
                            reject(new Error(`${ error } ${ result || '' }`))
                        else {
                            assertReturn(result);
                            resolve([ result, msgid ]);
                        }
                    });
                });
            }
        };
        return constructor;
    }, constructor);
}

Object.keys(api).forEach(function (className) {
    module.exports[className.toLowerCase()] = { client: { [className]: createConstructor(className) } };
});