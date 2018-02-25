const _ = require('lodash');

function toCamelCase(string) {
    return string.replace(/(_)([a-z])/g, (match, g1, g2) => g2.toUpperCase());
}
exports.toCamelCase = toCamelCase;

function toPascalCase(string) {
    return string.replace(/(^|_)([a-z])/g, (match, g1, g2) => g2.toUpperCase());
}
exports.toPascalCase = toPascalCase;

function toSnakeCase(string) {
    return string.replace(/((^[A-Z])|([A-Z]))/g, (m, g1, g2, g3) => g3 ? '_' + g3.toLowerCase() : g2.toLowerCase());
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

function castType(value, schema, types) {
    return handleCasting(castingHandlers, value, schema, types);
}
exports.castType = castType;

const castingHandlers = [
    {
        responsible: (schema) => '$ref' in schema,
        executor: (value, schema, types) => resolveType(schema['$ref'], types).fromTuple(value)
    },
    {
        responsible: (schema) => schema.type === 'array',
        executor: (values, schema, types) => {
            const nextItems = Array.isArray(schema.items) ? (items, index) => items[index] : (items) => items;
            return _.map(values, (e, index) => castType(e, nextItems(schema.items, index), types));
        }
    },
    {
        responsible: (schema) => (schema.type || 'object') === 'object',
        executor: (object, schema, types) => {
            const properties = _.toPairs(schema.properties || {});
            const patternProperties = _.toPairs(schema.patternProperties || {});
            return _.mapValues(object, (value, key) => {
                const schemas = properties.filter(([propertyName]) => propertyName === key)
                    .concat(patternProperties.filter(([pattern]) => (new RegExp(pattern)).test(key)))
                    .map(([, schema]) => schema);
                return schemas.reduce((value, schema) => castType(value, schema, types), value);
            });
        }
    }
];

function toTuple(value) {
    const hasToTuple = value && typeof value['toTuple'] === 'function';
    return hasToTuple ? value.toTuple() : Array.isArray(value) ? value.map(toTuple) : value;
}
exports.toTuple = toTuple;

function createType(typeName, schema) {
    const { items } = schema;
    const args = items.map(item => ([item['default'], toCamelCase(item.title)]))
        .map(([defaultValue, argumentName]) => defaultValue !== undefined ? `${argumentName}=${JSON.stringify(defaultValue)}` : argumentName)
        .join(',');
    const keys = items.map(item => item.title).map(toCamelCase);
    const properties = keys.map(key => `${key}: { enumerable: true, value: ${key} }`)
        .concat(`[Symbol.toStringTag]: { value: '${typeName}' }`).join(',');
    const functionBody = `Object.defineProperties(this, {${properties}})`;
    const constructor = new Function(args, functionBody);
    Object.defineProperties(constructor, {
        name: { configurable: true, value: typeName }
    });
    constructor.prototype.toTuple = function () {
        const self = this;
        return keys.map(key => self[key]).filter(value => value !== undefined).map(toTuple);
    };
    return constructor;
}

function createTypes(definitions, commonTypes) {
    const types = _.fromPairs(_.toPairs(definitions)
        .map(([, definition]) => ([toPascalCase(definition.title), definition]))
        .map(([name, schema]) => ([name, createType(name, schema)])));
    return defineFromTupleFunction(types, definitions, commonTypes);
}
exports.createTypes = createTypes;

function createFromTupleFunction(constructor, schema, typeReference) {
    const constructors = schema.items.map(item => {
        return '$ref' in item ? resolveType(item['$ref'], typeReference) : null;
    });
    return function (tuple) {
        const args = tuple.map((value, index) => constructors[index] ? constructors[index].fromTuple(value) : value);
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