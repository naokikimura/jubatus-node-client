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
    var constructor = function constructor(portNumber, hostName, clusterName, timeoutSeconds) {
        if (!(this instanceof constructor)) {
            throw new Error(className + ' is constructor.');
        }

        var port = portNumber || 9199,
            host = hostName || 'localhost',
            cluster = clusterName || 'cluster',
            timeoutMillis = (timeoutSeconds || 0) * 1000,
            client = rpc.createClient(port, host, timeoutMillis);
        this.getClient = function () {
            return client;
        };
        this.getClusterName = function () {
            return cluster;
        }
        return this;
    };

    return api[className].methods.map(method => {
        debug(method);
        var rpcName = method.id || method,
            methodName = camelCase(rpcName),
            assertParams = !isProduct && method.args ? params => {
                debug({ params: params, args: method.args });
                var schema = method.args,
                    result = validate(params, schema);
                assert.ok(result.valid, util.format('%j', result.errors));
            } : () => {};
      return [ rpcName, methodName, assertParams ];
    })
    .reduce((constructor, [ rpcName, methodName, assertParams ]) => {
        constructor.prototype[methodName] = function () {
            var self = this,
                client = self.getClient(),
                params = toArray(arguments),
                hasCallback = (typeof params[params.length - 1] === 'function');
            assertParams(params);
            params.unshift(self.getClusterName());
            if (hasCallback) {
                let callback = params.pop();
                client.call(rpcName, params, (error, result, msgid) => {
                    callback.call(self, error && new Error(`${ error } ${ result || '' }`),
                            error ? null : result, msgid);
                });
            } else {
                return new Promise((resolve, reject) => {
                    client.call(rpcName, params, (error, result, msgid) => {
                        if (error)
                            reject(new Error(`${ error } ${ result || '' }`))
                        else
                            resolve([ result, msgid ]);
                    });
                });
            }
        };
        return constructor;
    }, constructor);
}

Object.keys(api).forEach(function (className) {
    var client = {};
    client[className] = createConstructor(className);
    module.exports[className.toLowerCase()] = { client: client };
});
