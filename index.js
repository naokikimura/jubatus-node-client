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

function createConstructor(className) {
    var constructor = function (portNumber, hostName, timeoutSeconds) {
        if (!(this instanceof constructor)) {
            throw new Error(className + ' is constructor.');
        }

        var port = portNumber || 9199,
            host = hostName || 'localhost',
            timeoutMillis = (timeoutSeconds || 0) * 1000,
            client = rpc.createClient(port, host, timeoutMillis);
        this.get_client = function () {
            return client;
        };
        return this;
    };

    api[className].methods.forEach(function (method) {
        debug(method);
        var methodName = method.name || method,
            assertParams = !isProduct && method.args ? function (params) {
                debug({ params: params, args: method.args });
                var schema = {
                        type: 'array',
                        items: method.args,
                        minItems: method.args.length,
                        maxItems: method.args.length
                    },
                    result = validate(params, schema);
                assert.ok(result.valid, util.format('%j', result.errors));
            } : function () {};
        constructor.prototype[methodName] = function () {
            var client = this.get_client(),
                params = toArray(arguments),
                hasCallback = (typeof params[params.length - 1] === 'function'),
                callback = hasCallback ? params.pop() : function () {};
            assertParams(params);
            client.call(methodName, params, function (error, result, msgid) {
                callback(error && new Error(util.format('%s %s', error, result || '')),
                        error ? null : result, msgid);
            });
        };
    });
    return constructor;
}

Object.keys(api).forEach(function (className) {
    var client = {};
    client[className] = createConstructor(className);
    module.exports[className.toLowerCase()] = { client: client };
});
