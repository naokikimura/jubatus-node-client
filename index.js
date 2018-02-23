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

function toSnakeCase(value) {
    return value.replace(/(^[A-Z])|([A-Z])/g, (match, g1, g2) => g1 ? g1.toLowerCase() : '_' + g2.toLowerCase());
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
    const constructor = function constructor(...args) {
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

    return constructor;
}

function buildMethods(schema, constructor, types) {
    return Object.keys(schema.properties)
        .map(method => ([method, schema.properties[method]]))
        .map(([rpcName, { properties: { 'arguments': argumentsSchema, 'return': returnSchema } }]) => {
            argumentsSchema.definitions = returnSchema.definitions = schema.definitions;
            const validator = new jsonschema.Validator();
            const methodName = toCamelCase(rpcName),
                assertParams = isProduct ? () => { } : params => {
                    const result = validator.validate(params, argumentsSchema);
                    assert.ok(result.valid, util.format('%j', result.errors));
                },
                assertReturn = isProduct ? () => { } : returnValue => {
                    const result = validator.validate(returnValue, returnSchema);
                    assert.ok(result.valid, util.format('%j', result.errors));
                };
            const castTypeFunction = (value) => castType(value, returnSchema, types);
            return [rpcName, methodName, assertParams, assertReturn, castTypeFunction];
        })
        .reduce((constructor, [rpcName, methodName, assertParams, assertReturn, castTypeFunction]) => {
            constructor.prototype[methodName] = function (...args) {
                const self = this,
                    client = self.getClient(),
                    callback = (typeof args[args.length - 1] === 'function') && args.pop();
                const params = toTuple(args);
                assertParams(params);
                params.unshift(self.getName());
                if (callback) {
                    client.request.apply(client, [rpcName].concat(params, (error, result, msgid) => {
                        if (!error) { assertReturn(result); }
                        callback.call(self, error, error ? result : castTypeFunction(result), msgid);
                    }));
                } else {
                    return client.request.apply(client, [rpcName].concat(params))
                        .then(([result]) => {
                            assertReturn(result);
                            return castTypeFunction(result);
                        });
                }
            };
            return constructor;
        }, constructor);
}

function createClientConstructor(className, schema, superConstructor, types) {
    const constructor = function constructor(...args) {
        assert(this instanceof constructor, `${className} is constructor.`);

        superConstructor.apply(this, args);
        return this;
    };
    util.inherits(constructor, superConstructor);
    return buildMethods(schema, constructor, types);
}

function toTuple(value) {
    return value && typeof value['toTuple'] === 'function' ? value.toTuple() : Array.isArray(value) ? value.map(toTuple) : value;
}

function CastingHandler(schema, type, responsible, executor) {
    let nextHandler;
    return {
        setNext: function (next) {
            nextHandler = next;
            return next;
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
            executor: (value) => {
                const nextItems = Array.isArray(schema.items) ? (items, index) => items[index] : (items) => items;
                return value.map((e, index) => castType(e, nextItems(schema.items, index), types));
            }
        },
        {
            responsible: (schema) => (schema.type || 'object') === 'object',
            executor: (value) => {
                const properties = Object.keys(schema.properties || {})
                    .map(propertyName => ({ propertyName, schema: schema.properties[propertyName] }));
                const patternProperties = Object.keys(schema.patternProperties || {})
                    .map(propertyName => ({ propertyName, schema: schema.patternProperties[propertyName] }));
                return Object.keys(value)
                    .map(key => ({ key, value: value[key] }))
                    .map(({ key, value }) => {
                        const schemas = []
                            .concat(properties.filter(({ propertyName }) => propertyName === key))
                            .concat(patternProperties.filter(({ pattern }) => (new RegExp(pattern).test(key))))
                            .map(({ schema }) => schema);
                        const typedValue = schemas.reduce((value, schema) => castType(value, schema, types), value);
                        return { [key]: typedValue };
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
    return Object.keys(definitions)
        .filter(key => !ignoreKeys.includes(key))
        .map(key => definitions[key])
        .map(definition => ([toCamelCase('_' + definition.title), definition.items]))
        .map(([name, items]) => {
            const keys = items.map(item => item.title).map(toCamelCase);
            const properties = keys
                .map(key => `${key}: { enumerable: true, value: ${key} }`)
                .concat(`[Symbol.toStringTag]: { value: '${name}' }`).join(',');
            const functionBody = `Object.defineProperties(this, {${properties}})`;
            const args = items.map(item => ({ 'default': item['default'], argument: toCamelCase(item.title) }))
                .map(({ 'default': defaultValue, argument }) => defaultValue !== undefined ? `${argument}=${JSON.stringify(defaultValue)}` : argument)
                .join(',');
            const constructor = new Function(args, functionBody);
            constructor.prototype.toTuple = function () {
                const self = this;
                return keys.map(key => self[key]).filter(value => value !== undefined).map(toTuple);
            };
            return ({ [name]: constructor });
        })
        .reduce((accumulator, current) => Object.assign(accumulator, current), {});
}

function resolveTypeName(pointer) {
    const p = pointer || '';
    return toCamelCase('_' + p.substring(p.lastIndexOf('/') + 1));
}

function resolveType(pointer, types) {
    return (types || {})[resolveTypeName(pointer)] || { fromTuple: (value) => value };
}

function defineFromTupleFunction(types, definitions, commonTypes) {
    return Object.keys(types).map(key => ([key, types[key]])).map(([typeName, constructor]) => {
        const definitionKey = toSnakeCase(typeName);
        const constractors = definitions[definitionKey].items.map(item => {
            return '$ref' in item ? types[resolveTypeName(item['$ref'])] || commonTypes[resolveTypeName(item['$ref'])] : null;
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
    .filter(file => path.extname(file) === '.json')
    .filter(file => fs.statSync(file).isFile())
    .map(file => {
        const service = toCamelCase('_' + path.basename(file, '.json'));
        const schema = JSON.parse(fs.readFileSync(file));
        return ({ [service]: schema });
    })
    .reduce((accumulator, current) => Object.assign(accumulator, current), {});
const { Common: common } = services;
const schemas = Object.keys(services)
    .filter(serviceName => serviceName !== 'Common')
    .map(serviceName => {
        const service = services[serviceName];
        Object.assign(service.definitions, common.definitions);
        return { [serviceName]: service };
    })
    .reduce((accumulator, current) => Object.assign(accumulator, current));
const commonConstructor = createClientConstructor('Common', common, createSuperConstructor());
const commonDefinitionKeys = Object.keys(common.definitions);
const commonTypes = defineFromTupleFunction(createTypes(common.definitions, []), common.definitions, {});
Object.keys(commonTypes)
    .filter(typeName => typeName === 'Datum')
    .map(typeName => commonTypes[typeName])
    .forEach(defineDatumPrototypeFunction);
module.exports['common'] = { types: commonTypes, toTuple };
Object.keys(schemas).forEach(function (className) {
    const schema = schemas[className];
    debug(className, schema);
    const definitions = schema.definitions;
    const types = defineFromTupleFunction(createTypes(definitions, commonDefinitionKeys), definitions, commonTypes);
    const clientConstructor = createClientConstructor(className, schema, commonConstructor, Object.assign(Object.assign({}, commonTypes), types));
    module.exports[className.toLowerCase()] = { client: { [className]: clientConstructor }, types };
});