/*jslint node: true */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const util = require('util');
const jsonschema = require('jsonschema');
const debug = require('./lib/debug')('jubatus-node-client');
const rpc = require('msgpack-rpc-lite');

// Hack
jsonschema.Validator.prototype.types.number = function (instance) {
    return typeof instance === 'number';
};

const isProduct = process.env.NODE_ENV && (/production/).test(process.env.NODE_ENV);

function toCamelCase(value) {
    return value.replace(/_([a-z])/g, (match, group1) => group1.toUpperCase());
}

function toSnakeCase(value) {
    return value.replace(/(^[A-Z])|([A-Z])/g, (match, g1, g2) => g1 ? g1.toLowerCase() : '_' + g2.toLowerCase());
}

function toPairs(object) {
    return Object.keys(object).map(key => ([key, object[key]]));
}

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

function definePrototypeMethods(schema, constructor, types) {
    return toPairs(schema.properties)
        .map(([rpcName, { properties: { 'arguments': argumentsSchema, 'return': returnSchema } }]) => {
            argumentsSchema.definitions = returnSchema.definitions = schema.definitions;
            const validator = new jsonschema.Validator();
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
            const castTypeFunction = (value) => castType(value, returnSchema, types);
            const argumentsHandles = [toTuple, !isProduct && assertParams];
            const returnHandles = [!isProduct && assertReturn, castTypeFunction];
            return [rpcName, toCamelCase(rpcName), argumentsHandles, returnHandles];
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

function createClientConstructor(className, schema, superConstructor, types) {
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
    return definePrototypeMethods(schema, constructor, types);
}

function toTuple(value) {
    const hasToTuple = value && typeof value['toTuple'] === 'function';
    return hasToTuple ? value.toTuple() : Array.isArray(value) ? value.map(toTuple) : value;
}

function resolveType(pointer = '', types = {}) {
    const name = toCamelCase('_' + pointer.substring(pointer.lastIndexOf('/') + 1));
    return types[name] || { fromTuple: (value) => value };
}

function CastingHandler(schema, type, responsible, executor) {
    let nextHandler;
    return {
        setNext: function (next) {
            return nextHandler = next;
        },
        handle: function (value) {
            return responsible(schema) ? executor(value, schema, type) : nextHandler.handle(value);
        }
    };
}

function castType(value, schema, types) {
    const castingHandlers = [
        {
            responsible: (schema) => '$ref' in schema,
            executor: (value) => resolveType(schema['$ref'], types).fromTuple(value)
        },
        {
            responsible: (schema) => schema.type === 'array',
            executor: (values) => {
                const nextItems = Array.isArray(schema.items) ? (items, index) => items[index] : (items) => items;
                return values.map((e, index) => castType(e, nextItems(schema.items, index), types));
            }
        },
        {
            responsible: (schema) => (schema.type || 'object') === 'object',
            executor: (value) => {
                const properties = toPairs(schema.properties || {});
                const patternProperties = toPairs(schema.patternProperties || {});
                return toPairs(value)
                    .map(([key, value]) => {
                        const schemas = properties.filter(([propertyName]) => propertyName === key)
                            .concat(patternProperties.filter(([pattern]) => (new RegExp(pattern)).test(key)))
                            .map(([, schema]) => schema);
                        return { [key]: schemas.reduce((value, schema) => castType(value, schema, types), value) };
                    })
                    .reduce((accumulator, current) => Object.assign(accumulator, current), {});
            }
        },
        { responsible: () => true, executor: (value) => value }
    ];
    const handler = CastingHandler(schema, types, () => false, () => {});
    castingHandlers.reduce((accumulator, { responsible, executor }) => {
        return accumulator.setNext(CastingHandler(schema, types, responsible, executor));
    }, handler);
    return handler.handle(value);
}

function createTypes(definitions, ignoreKeys) {
    return toPairs(definitions)
        .filter(([key]) => !ignoreKeys.includes(key))
        .map(([, definition]) => ([toCamelCase('_' + definition.title), definition.items]))
        .map(([name, items]) => {
            const args = items.map(item => ({ 'default': item['default'], argument: toCamelCase(item.title) }))
                .map(({ 'default': defaultValue, argument }) => defaultValue !== undefined ? `${argument}=${JSON.stringify(defaultValue)}` : argument)
                .join(',');
            const keys = items.map(item => item.title).map(toCamelCase);
            const properties = keys.map(key => `${key}: { enumerable: true, value: ${key} }`)
                .concat(`[Symbol.toStringTag]: { value: '${name}' }`).join(',');
            const functionBody = `Object.defineProperties(this, {${properties}})`;
            const constructor = new Function(args, functionBody);
            Object.defineProperties(constructor, {
                name: { configurable: true, value: name }
            });
            constructor.prototype.toTuple = function () {
                const self = this;
                return keys.map(key => self[key]).filter(value => value !== undefined).map(toTuple);
            };
            return ({ [name]: constructor });
        })
        .reduce((accumulator, current) => Object.assign(accumulator, current), {});
}

function defineFromTupleFunction(types, definitions, commonTypes) {
    const typeReference = Object.assign({}, types, commonTypes);
    return toPairs(types).map(([typeName, constructor]) => {
        const constractors = definitions[toSnakeCase(typeName)].items.map(item => {
            return '$ref' in item ? resolveType(item['$ref'], typeReference) : null;
        });
        constructor.fromTuple = function (tuple) {
            const args = tuple.map((value, index) => constractors[index] ? constractors[index].fromTuple(value) : value);
            return new (Function.prototype.bind.apply(constructor, [null].concat(args)));
        };
        return { [typeName]: constructor };
    }).reduce((accumulator, current) => Object.assign(accumulator, current), {});
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
    .map(file => ({ [toCamelCase('_' + path.basename(file, '.json'))]: JSON.parse(fs.readFileSync(file)) }))
    .reduce((accumulator, current) => Object.assign(accumulator, current), {});
const { Common: common } = services;
const commonConstructor = createClientConstructor('Common', common, createSuperConstructor());
const commonDefinitionKeys = Object.keys(common.definitions);
const commonTypes = defineFromTupleFunction(createTypes(common.definitions, []), common.definitions, {});
toPairs(commonTypes)
    .filter(([typeName]) => typeName === 'Datum')
    .forEach(([, constractor]) => defineDatumPrototypeFunction(constractor));
module.exports['common'] = { types: commonTypes, toTuple };
toPairs(services).filter(([serviceName]) => serviceName !== 'Common').forEach(([className, schema]) => {
    debug(className, schema);
    const definitions = Object.assign(schema.definitions, common.definitions);
    const types = defineFromTupleFunction(createTypes(definitions, commonDefinitionKeys), definitions, commonTypes);
    const typeReference = Object.assign({}, types, commonTypes);
    const clientConstructor = createClientConstructor(className, schema, commonConstructor, typeReference);
    module.exports[className.toLowerCase()] = { client: { [className]: clientConstructor }, types };
});