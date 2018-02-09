/*jslint node: true */

const assert = require('assert');
const util = require('util');
const jsonschema = require('jsonschema');
const debug = require('./lib/debug')('jubatus-node-client');
const api = require('./api');
const rpc = require('./lib/msgpack-rpc');

const isProduct = process.env.NODE_ENV && (/production/).test(process.env.NODE_ENV);

function camelCase(input) {
    return input.toLowerCase().replace(/_(.)/g, function(match, group1) {
        return group1.toUpperCase();
    });
}

function createConstructor(className) {
    var constructor = function constructor(options = 9199, ...args) {
        if (!(this instanceof constructor)) { throw new Error(`${className} is constructor.`); }

        const rpcClient = options instanceof rpc.Client ? options : options.rpcClient;
        const port = typeof options === 'number' ? options : (options.port || 9199);
        const host = options.host || args[0] || 'localhost';
        let name = options.name || args[1] || '';
        const timeoutSeconds = options.timeoutSeconds || args[2] || 0;
        const client = rpcClient || rpc.createClient(port, host, timeoutSeconds * 1000);

        Object.defineProperty(this, 'client', {
            get() { return client; }
        });
        Object.defineProperty(this, 'name', {
            get() { return name; },
            set(value) { name = value; }
        });
        return this;
    };

    // This is not an RPC method.
    constructor.prototype.getClient = function () {
        return this.client;
    };

    // This is not an RPC method.
    constructor.prototype.getName = function () {
        return this.name;
    };

    // This is not an RPC method.
    constructor.prototype.setName = function (value) {
        this.name = value;
    };

    return api[className].methods.map(method => {
        debug(method);
        const { id: rpcName, properties: { args, 'return': returnType } } = method,
            methodName = camelCase(rpcName),
            assertParams = isProduct ? () => {} : params => {
                debug({ params, args });
                const validator = api[className].types.reduce((accumulator, current) => {
                    accumulator.addSchema(current, `/types/${ current.id }`);
                    return accumulator;
                }, new jsonschema.Validator());
                const result = validator.validate(params, args);
                assert.ok(result.valid, util.format('%j', result.errors));
            },
            assertReturn = isProduct ? () => {} : returnValue => {
                debug({ returnValue, returnType });
                const validator = api[className].types.reduce((accumulator, current) => {
                    accumulator.addSchema(current, `/types/${ current.id }`);
                    return accumulator;
                }, new jsonschema.Validator());
                const result = validator.validate(returnValue, returnType);
                assert.ok(result.valid, util.format('%j', result.errors));
            };
        return [ rpcName, methodName, assertParams, assertReturn ];
    }).reduce((constructor, [ rpcName, methodName, assertParams, assertReturn ]) => {
        constructor.prototype[methodName] = function (...params) {
            const self = this,
                client = self.getClient(),
                callback = (typeof params[params.length - 1] === 'function') && params.pop();
            assertParams(params);
            params.unshift(self.getName());
            if (callback) {
                client.call(rpcName, params, (error, result, msgid) => {
                    if (!error) { assertReturn(result); }
                    callback.call(self, error, result, msgid);
                });
            } else {
                return client.call(rpcName, params);
            }
        };
        return constructor;
    }, constructor);
}

Object.keys(api).forEach(function (className) {
    module.exports[className.toLowerCase()] = { client: { [className]: createConstructor(className) } };
});