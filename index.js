const assert = require('assert');
const fs = require('fs');
const path = require('path');
const util = require('util');
const _ = require('lodash');
const ajv = require('ajv');
const rpc = require('msgpack-rpc-lite');
const debug = require('./lib/debug')('jubatus-node-client');
const typing = require('./lib/typing');

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

function definePrototypeMethods(constructor, typeReference, schema, subSchema = {}) {
    return _.toPairs(schema.properties)
        .map(([rpcName, { properties: { 'arguments': argumentsSchema, 'return': returnSchema } }]) => {
            argumentsSchema.definitions = returnSchema.definitions = schema.definitions;
            const ajvOptions = {
                logger: debug.enabled && { log: debug, warn: debug, error: debug },
                schemaId: 'id',
                validateSchema: debug.enabled
            };
            const validator = ajv(ajvOptions)
                .addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'))
                .addSchema(subSchema, 'sub');
            const argumentsValidate = validator.compile(argumentsSchema);
            const returnValidate = validator.compile(returnSchema);
            const createAssertWith = (assert, validate) =>
                value => {
                    const valid = validate(value);
                    assert.ok(valid, util.format('%j', validate.errors));
                    return value;
                };
            const assertParams = createAssertWith(assert, argumentsValidate);
            const assertReturn = createAssertWith(assert, returnValidate);
            const contextSchema = { base: schema.id, schema: returnSchema };
            const castFunction = (value) => typing.castTupleConvertibleType(value, contextSchema, typeReference);
            const argumentsHandles = [typing.toTuple, !isProduct && assertParams];
            const returnHandles = [!isProduct && assertReturn, castFunction];
            return [rpcName, typing.toCamelCase(rpcName), argumentsHandles, returnHandles];
        })
        .reduce((constructor, [rpcName, methodName, argumentsHandles, returnHandles]) => {
            const handler = (value, handle) => handle ? handle(value) : value;
            constructor.prototype[methodName] = function (...args) {
                return new Promise(resolve => resolve(argumentsHandles.reduce(handler, args)))
                    .then(params => {
                        const { client, name } = this;
                        return client.request(rpcName, name, ...params)
                            .then(([result]) => returnHandles.reduce(handler, result));
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

function defineDatumPrototypeFunctions(datumFunction) {
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
    return datumFunction;
}

const dirname = path.resolve(__dirname, './api/');
const services = fs.readdirSync(dirname)
    .map(file => path.resolve(dirname, file))
    .filter(file => path.extname(file) === '.json' && fs.statSync(file).isFile())
    .map(file => ({ [typing.toPascalCase(path.basename(file, '.json'))]: JSON.parse(fs.readFileSync(file)) }))
    .reduce((accumulator, current) => Object.assign(accumulator, current), {});
const { Common: commonSchema } = services;
const [commonTypes, commonTypeReference] = typing.createTupleConvertibleTypes(commonSchema, {});
const commonConstructor = createClientConstructor('Common', createSuperConstructor(), commonTypeReference, commonSchema);
_.at(commonTypes, 'Datum').forEach(defineDatumPrototypeFunctions);
module.exports['common'] = { types: commonTypes, toTuple: typing.toTuple };
_.toPairs(_.omit(services, 'Common')).forEach(([className, schema]) => {
    debug(className, schema);
    const [types, typeReference] = typing.createTupleConvertibleTypes(schema, commonTypeReference);
    const clientConstructor = createClientConstructor(className, commonConstructor, typeReference, schema, commonSchema);
    module.exports[className.toLowerCase()] = { client: { [className]: clientConstructor }, types };
});