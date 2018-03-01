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

function toSnakeCase(string) {
    return words(string).map((word, index) => (index ? '_' : '') + word.toLowerCase()).join('');
}
exports.toSnakeCase = toSnakeCase;

function resolveType(pointer = '', types = {}) {
    const name = toPascalCase(pointer.substring(pointer.lastIndexOf('/') + 1));
    return types[name] || { fromTuple: (value) => value };
}

function handleCasting(handlers, value, schema, types) {
    const { responsible, executor } = _.head(handlers) || { responsible: () => true, executor: (value) => value };
    return responsible(schema) ? executor(value, schema, types) : handleCasting(_.slice(handlers, 1), value, schema, types);
}

function castTupleConvertibleType(value, schema, types) {
    return handleCasting(castingHandlers, value, schema, types);
}
exports.castTupleConvertibleType = castTupleConvertibleType;

const castingHandlers = [
    {
        responsible: (schema) => '$ref' in schema,
        executor: (value, schema, types) => resolveType(schema['$ref'], types).fromTuple(value)
    },
    {
        responsible: (schema) => schema.type === 'array',
        executor: (values, schema, types) => {
            const nextItems = Array.isArray(schema.items) ? (items, index) => items[index] : (items) => items;
            return _.map(values, (e, index) => castTupleConvertibleType(e, nextItems(schema.items, index), types));
        }
    },
    {
        responsible: (schema) => (schema.type || 'object') === 'object',
        executor: (object, schema, types) => {
            const properties = _.toPairs(schema.properties);
            const patternProperties = _.toPairs(schema.patternProperties);
            return _.mapValues(object, (value, key) => {
                const schemas = properties.filter(([propertyName]) => propertyName === key)
                    .concat(patternProperties.filter(([pattern]) => (new RegExp(pattern)).test(key)))
                    .map(([, schema]) => schema);
                return schemas.reduce((value, schema) => castTupleConvertibleType(value, schema, types), value);
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

function createTupleConvertibleTypes(definitions, commonTypes) {
    const types = _.fromPairs(_.toPairs(definitions)
        .map(([key, definition]) => ([toPascalCase(definition.title || key), definition]))
        .map(([name, schema]) => ([name, createTupleConvertibleType(name, schema)])));
    return defineFromTupleFunction(types, definitions, commonTypes);
}
exports.createTupleConvertibleTypes = createTupleConvertibleTypes;

function createFromTupleFunction(constructor, schema, typeReference) {
    const types = schema.items.map(item => {
        const type = '$ref' in item ? resolveType(item['$ref'], typeReference) : {};
        return _.defaults(type, { fromTuple: (tuple) => tuple });
    });
    return function fromTuple(tuple) {
        const args = _.zip(types, tuple).map(([type, value]) => type.fromTuple(value));
        return new (Function.prototype.bind.apply(constructor, [null].concat(args)));
    };
}

function defineFromTupleFunction(types, definitions, commonTypes) {
    const typeReference = Object.assign({}, types, commonTypes);
    return _.mapValues(types, (constructor, typeName) => {
        const schema = definitions[toSnakeCase(typeName)];
        constructor.fromTuple = createFromTupleFunction(constructor, schema, typeReference);
        return constructor;
    });
}