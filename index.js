const assert = require('assert');
const fs = require('fs');
const path = require('path');
const util = require('util');
const _ = require('lodash');
const jsonschema = require('jsonschema');
const rpc = require('msgpack-rpc-lite');
const debug = require('./lib/debug')('jubatus-node-client');
const typing = require('./lib/typing');

// Hack
jsonschema.Validator.prototype.types.number = function (instance) {
    return typeof instance === 'number';
};

const isProduct = process.env.NODE_ENV && (/production/).test(process.env.NODE_ENV);

function toOptions(args) {
    const first = args.shift() || {};
    const rpcClient = first instanceof rpc.Client ? first : first.rpcClient;
    const port = typeof first === 'number' ? first : first.port;
    const host = first.host || args[0];
    const name = first.name || args[1];
    const timeoutSeconds = first.timeoutSeconds || args[2];
    return { rpcClient, port, host, name, timeoutSeconds };
}

function createSuperConstructor() {
    const constructor = function JubatusClientBase(...args) {
        const options = toOptions(args);
        const { port = 9199, host = 'localhost', timeoutSeconds = 0, rpcClient } = options;
        let { name = '' } = options;
        const codecOptions = { encode: { useraw: true } };
        const client = rpcClient || rpc.createClient(port, host, timeoutSeconds * 1000, codecOptions);
        Object.defineProperties(this, {
            'client': {
                get() { return client; }
            },
            'name': {
                get() { return name; },
                set(value) { name = value; }
            }
        });
        return this;
    };

    constructor.prototype.getClient = function () {
        return this.client;
    };
    constructor.prototype.getName = function () {
        return this.name;
    };
    constructor.prototype.setName = function (value) {
        this.name = value;
    };

    return constructor;
}

function definePrototypeMethods(constructor, types, schema, subSchema = {}) {
    return _.toPairs(schema.properties)
        .map(([rpcName, { properties: { 'arguments': argumentsSchema, 'return': returnSchema } }]) => {
            argumentsSchema.definitions = returnSchema.definitions = schema.definitions;
            const validator = new jsonschema.Validator();
            validator.addSchema(subSchema);
            const assertParams = params => {
                const result = validator.validate(params, argumentsSchema);
                assert.ok(result.valid, util.format('%j', result.errors));
                return params;
            };
            const assertReturn = returnValue => {
                const result = validator.validate(returnValue, returnSchema);
                assert.ok(result.valid, util.format('%j', result.errors));
                return returnValue;
            };
            const castTypeFunction = (value) => typing.castType(value, returnSchema, types);
            const argumentsHandles = [typing.toTuple, !isProduct && assertParams];
            const returnHandles = [!isProduct && assertReturn, castTypeFunction];
            return [rpcName, typing.toCamelCase(rpcName), argumentsHandles, returnHandles];
        })
        .reduce((constructor, [rpcName, methodName, argumentsHandles, returnHandles]) => {
            const handler = (value, handle) => handle ? handle(value) : value;
            constructor.prototype[methodName] = function (...args) {
                const { client, name } = this;
                const params = argumentsHandles.reduce(handler, args);
                return client.request.apply(client, [rpcName].concat(name, params)).then(([result]) => {
                    return returnHandles.reduce(handler, result);
                });
            };
            return constructor;
        }, constructor);
}

function createClientConstructor(className, superConstructor, types, schema, subSchema) {
    const constructor = function JubatusClient(...args) {
        assert(this instanceof constructor, `${className} is constructor.`);

        superConstructor.apply(this, args);
        Object.defineProperties(this, {
            [Symbol.toStringTag]: { configurable: true, value: className }
        });
        return this;
    };
    Object.defineProperties(constructor, {
        name: { configurable: true, value: className }
    });
    util.inherits(constructor, superConstructor);
    return definePrototypeMethods(constructor, types, schema, subSchema);
}

function defineDatumPrototypeFunction(datumFunction) {
    const prototype = datumFunction.prototype;
    prototype.addString = function (key, value) {
        this.stringValues.push([key, value]);
        return this;
    };
    prototype.addNumber = function (key, value) {
        this.numValues.push([key, value]);
        return this;
    };
    prototype.addBinary = function (key, value) {
        this.binaryValues.push([key, value]);
        return this;
    };
    return prototype;
}

const dirname = path.resolve(__dirname, './api/');
const services = fs.readdirSync(dirname)
    .map(file => path.resolve(dirname, file))
    .filter(file => path.extname(file) === '.json' && fs.statSync(file).isFile())
    .map(file => ({ [typing.toPascalCase(path.basename(file, '.json'))]: JSON.parse(fs.readFileSync(file)) }))
    .reduce((accumulator, current) => Object.assign(accumulator, current), {});
const { Common: commonSchema } = services;
const commonTypes = typing.createTypes(commonSchema.definitions, {});
const commonConstructor = createClientConstructor('Common', createSuperConstructor(), commonTypes, commonSchema);
_.toPairs(commonTypes)
    .filter(([typeName]) => typeName === 'Datum')
    .forEach(([, constractor]) => defineDatumPrototypeFunction(constractor));
module.exports['common'] = { types: commonTypes, toTuple: typing.toTuple };
_.toPairs(services).filter(([serviceName]) => serviceName !== 'Common').forEach(([className, schema]) => {
    debug(className, schema);
    const types = typing.createTypes(schema.definitions, commonTypes);
    const typeReference = Object.assign({}, types, commonTypes);
    const clientConstructor = createClientConstructor(className, commonConstructor, typeReference, schema, commonSchema);
    module.exports[className.toLowerCase()] = { client: { [className]: clientConstructor }, types };
});