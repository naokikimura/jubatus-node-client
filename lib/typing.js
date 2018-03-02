const url = require('url');
const _ = require('lodash');

function words(string) {
    return _.words(string, /([a-z][a-z0-9]*|[A-Z][a-z0-9]+|[A-Z]+)/g);
}

function toCamelCase(string) {
    return words(string)
        .map((word, index) => (index ? _.upperFirst : _.lowerFirst)(word.toLowerCase())).join('');
}
exports.toCamelCase = toCamelCase;

function toPascalCase(string) {
    return words(string).map(word => _.upperFirst(word.toLowerCase())).join('');
}
exports.toPascalCase = toPascalCase;

function resolveType(pointer = '', base = '', typeReference = {}) {
    const key = url.resolve(base, pointer);
    return _.get(typeReference, key) || { fromTuple: (value) => value };
}

function handleCasting(handlers, value, contextSchema, typeReference) {
    const { schema } = contextSchema;
    const { responsible, executor } = _.head(handlers) || { responsible: () => true, executor: (value) => value };
    return responsible(schema) ? executor(value, contextSchema, typeReference) : handleCasting(_.slice(handlers, 1), value, contextSchema, typeReference);
}

function castTupleConvertibleType(value, contextSchema, typeReference) {
    return handleCasting(castingHandlers, value, contextSchema, typeReference);
}
exports.castTupleConvertibleType = castTupleConvertibleType;

const castingHandlers = [
    {
        responsible: (schema) => '$ref' in schema,
        executor: (value, { base, schema }, typeReference) => resolveType(schema['$ref'], base, typeReference).fromTuple(value)
    },
    {
        responsible: (schema) => schema.type === 'array',
        executor: (values, { base, schema }, typeReference) => {
            const nextItems = Array.isArray(schema.items) ? (items, index) => items[index] : (items) => items;
            return _.map(values, (e, index) => castTupleConvertibleType(e, { base, schema: nextItems(schema.items, index)}, typeReference));
        }
    },
    {
        responsible: (schema) => (schema.type || 'object') === 'object',
        executor: (object, { base, schema }, typeReference) => {
            const properties = _.toPairs(schema.properties);
            const patternProperties = _.toPairs(schema.patternProperties);
            return _.mapValues(object, (value, key) => {
                const schemas = properties.filter(([propertyName]) => propertyName === key)
                    .concat(patternProperties.filter(([pattern]) => (new RegExp(pattern)).test(key)))
                    .map(([, schema]) => schema);
                return schemas.reduce((value, schema) => castTupleConvertibleType(value, { base, schema }, typeReference), value);
            });
        }
    }
];

function toTuple(value) {
    const hasToTuple = value && typeof value['toTuple'] === 'function';
    return hasToTuple ? value.toTuple() : Array.isArray(value) ? _.map(value, toTuple) : value;
}
exports.toTuple = toTuple;

function createTupleConvertibleType(typeName, schema) {
    const { items } = schema;
    const args = items.map(item => ([item['default'], toCamelCase(item.title)]))
        .map(([defaultValue, argName]) => _.isUndefined(defaultValue) ? argName : `${argName}=${JSON.stringify(defaultValue)}`)
        .join(',');
    const keys = items.map(item => item.title).map(toCamelCase).map(key =>([key]));
    const properties = keys.map(key => `${key}: { enumerable: true, value: ${key} }`)
        .concat(`[Symbol.toStringTag]: { value: '${typeName}' }`).join(',');
    const functionBody = `Object.defineProperties(this, {${properties}})`;
    const constructor = new Function(args, functionBody);
    Object.defineProperties(constructor, {
        name: { configurable: true, value: typeName }
    });
    constructor.prototype.toTuple = function () {
        return _.at(this, keys).map(toTuple);
    };
    return constructor;
}

function createTupleConvertibleTypes(schema, commonTypeReference) {
    const { id = '', definitions } = schema;
    const base = url.resolve(id, '#/definitions/');
    const typeReference = _.fromPairs(_.toPairs(definitions)
        .map(([key, definition]) => ([base + key, toPascalCase(definition.title || key), definition]))
        .map(([url, name, schema]) => ([url, createTupleConvertibleType(name, schema)])));
    const types = _.mapKeys(typeReference, value => value.name);
    Object.assign(typeReference, commonTypeReference);
    return [defineFromTupleFunction(types, schema, typeReference), typeReference];
}
exports.createTupleConvertibleTypes = createTupleConvertibleTypes;

function createFromTupleFunction(constructor, { base, schema }, typeReference) {
    const types = schema.items.map(item => {
        const type = '$ref' in item ? resolveType(item['$ref'], base, typeReference) : {};
        return _.defaults(type, { fromTuple: (tuple) => tuple });
    });
    return function fromTuple(tuple) {
        const args = _.zip(types, tuple).map(([type, value]) => type.fromTuple(value));
        return new (Function.prototype.bind.apply(constructor, [null].concat(args)));
    };
}

function defineFromTupleFunction(types, { id = '', definitions }, typeReference) {
    return _.mapValues(types, (constructor, typeName) => {
        const typeReferenceKey = _.findKey(typeReference, { name: typeName });
        const path = url.parse(typeReferenceKey).hash.replace(/^#\/definitions\/(.*)$/g, '$1');
        const schema = _.get(definitions, path);
        constructor.fromTuple = createFromTupleFunction(constructor, { base: id, schema }, typeReference);
        return constructor;
    });
}