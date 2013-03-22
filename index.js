/*jslint node: true */

var assert = require('assert'),
    util = require('util'),
    validate = require('json-schema').validate,
    api = require('./api'),
    rpc = require('./lib/msgpack-rpc');

var isDebugEnabled = process.env.NODE_DEBUG && (/jubatus/).test(process.env.NODE_DEBUG),
    isProduct = process.env.NODE_ENV && (/production/).test(process.env.NODE_ENV),
    debug = isDebugEnabled ? function (x) { console.error('JUBATUS:', x); } : function () {};

function toArray(args) {
    return Array.prototype.slice.call(args);
}

function createConstructor(className) {
    var constructor = function (portNumber, hostName) {
        if (!(this instanceof constructor)) {
            throw new Error(className + ' is constructor.');
        }

        var port = portNumber || 9199,
            host = hostName || 'localhost',
            client = rpc.createClient(port, host),
            propertyName;
        for (propertyName in this) {
            /*jslint forin: true */
            debug(propertyName);
            client[propertyName] = this[propertyName];
        }
        return client;
    };

    constructor.prototype.get_client = function () {
        return this;
    };

    api[className].methods.forEach(function (method) {
        debug(method);
        var methodName = method.name || method,
            assertParams = !isProduct && method.args ? function (params) {
                debug({ params: params, args: method.args });
                var schema = { type: 'array', items: method.args, minItems: method.args.length, maxItems: method.args.length },
                    result = validate(params, schema);
                assert.ok(result.valid, util.format('%j', result.errors));
            } : function () {};
        constructor.prototype[methodName] = function () {
            var params = toArray(arguments),
                hasCallback = (typeof params[params.length - 1] === 'function'),
                callback = hasCallback ? params.pop() : undefined;
            assertParams(params);
            this.call(methodName, params, function (error, result, msgid) {
                callback(error && new Error(result + ' (' + error + ')'), error ? null : result, msgid);
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
