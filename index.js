/*jslint node: true */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const util = require('util');
const jsonschema = require('jsonschema');
const debug = require('./lib/debug')('jubatus-node-client');
const rpc = require('msgpack-rpc-lite');

const isProduct = process.env.NODE_ENV && (/production/).test(process.env.NODE_ENV);

function toCamelCase(value) {
    return value.replace(/_([a-z])/g, (match, group1) => group1.toUpperCase());
}

function toOptions(args) {
    const options = args.length > 1 ? args.shift() : args;
    const rpcClient = options instanceof rpc.Client ? options : options.rpcClient;
    const port = typeof options === 'number' ? options : options.port;
    const host = options.host || args[0];
    const name = options.name || args[1];
    const timeoutSeconds = options.timeoutSeconds || args[2];
    return { rpcClient, port, host, name, timeoutSeconds };
}

function createConstructor(className, schema) {
    var constructor = function constructor(...args) {
        if (!(this instanceof constructor)) { throw new Error(`${className} is constructor.`); }

        const options = toOptions(args);
        const { port = 9199, host = 'localhost', timeoutSeconds = 0, rpcClient } = options;
        let { name = '' } = options ;
        const codecOptions = { encode: { useraw: true } };
        const client = rpcClient || rpc.createClient(port, host, timeoutSeconds * 1000, codecOptions);

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

    return schema.items.map(({ id: rpcName, properties: { 'arguments': argumentsSchema, 'return': returnSchema } }) => {
        argumentsSchema.definitions = returnSchema.definitions = schema.definitions;
        const validator = new jsonschema.Validator();
        const methodName = toCamelCase(rpcName),
            assertParams = isProduct ? () => {} : params => {
                const result = validator.validate(params, argumentsSchema);
                assert.ok(result.valid, util.format('%j', result.errors));
            },
            assertReturn = isProduct ? () => {} : returnValue => {
                const result = validator.validate(returnValue, returnSchema);
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

const dirname = path.resolve(__dirname, './api/');
const services = fs.readdirSync(dirname)
    .map(file => path.resolve(dirname, file))
    .filter(file => path.extname(file) === '.json')
    .filter(file => fs.statSync(file).isFile())
    .map(file => {
        const service = toCamelCase('_' + path.basename(file, '.json'));
        const schema = JSON.parse(fs.readFileSync(file).toString());
        return ({ [service]: schema });
    })
    .reduce((accumulator, current) => Object.assign(accumulator, current));
const { Common: common } = services;
const schemas = Object.keys(services)
    .filter(serviceName => serviceName !== 'Common')
    .map(serviceName =>{
        const service = services[serviceName];
        service.definitions = Object.assign(service.definitions, common.definitions);
        service.items = service.items.concat(common.items);
        return { [serviceName]: service };
    })
    .reduce((accumulator, current) => Object.assign(accumulator, current));
Object.keys(schemas).forEach(function (className) {
    const schema = schemas[className];
    debug(className, schema);
    const constructor = createConstructor(className, schema);
    module.exports[className.toLowerCase()] = { client: { [className]: constructor } };
});