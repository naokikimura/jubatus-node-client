/*jslint node: true */

const assert = require('assert');
const util = require('util');
const validate = require('json-schema').validate;
const debug = require('./lib/debug')('jubatus');
const api = require('./api');
const rpc = require('./lib/msgpack-rpc');

const isProduct = process.env.NODE_ENV && (/production/).test(process.env.NODE_ENV);

function toArray(args) {
    return Array.prototype.slice.call(args);
}

function camelCase(input) {
    return input.toLowerCase().replace(/_(.)/g, function(match, group1) {
        return group1.toUpperCase();
    });
}

function createConstructor(className) {
    var constructor = function constructor(port = 9199, host = 'localhost', name = '', timeoutSeconds = 0) {
        if (!(this instanceof constructor)) { throw new Error(`${className} is constructor.`); }

        const client = rpc.createClient(port, host, timeoutSeconds * 1000);

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
                const result = validate(params, args);
                assert.ok(result.valid, util.format('%j', result.errors));
            },
            assertReturn = isProduct ? () => {} : returnValue => {
                debug({ returnValue, returnType });
                const result = validate(returnValue, returnType);
                assert.ok(result.valid, util.format('%j', result.errors));
            };
      return [ rpcName, methodName, assertParams, assertReturn ];
    })
    .reduce((constructor, [ rpcName, methodName, assertParams, assertReturn ]) => {
        constructor.prototype[methodName] = function () {
            const self = this,
                client = self.getClient(),
                params = toArray(arguments),
                hasCallback = (typeof params[params.length - 1] === 'function');
            assertParams(params);
            params.unshift(self.getName());
            if (hasCallback) {
                const callback = params.pop();
                client.call(rpcName, params, (error, result, msgid) => {
                    if (error) {
                        callback.call(self, new Error(`${ error } ${ result || '' }`), null, msgid);
                    } else {
                        assertReturn(result);
                        callback.call(self, null, result, msgid);
                    }
                });
            } else {
                return new Promise((resolve, reject) => {
                    client.call(rpcName, params, (error, result, msgid) => {
                        if (error) {
                            reject(new Error(`${ error } ${ result || '' }`));
                        } else {
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