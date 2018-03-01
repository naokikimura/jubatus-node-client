const expect = require('chai').expect;
const debug = require('debug')('jubatus-node-client:test:typing');
const typing = require('../lib/typing');

describe('typing#toCamelCase', () => {
  it('sould return lower-camelcase', done => {
    expect(typing.toCamelCase('train')).to.equal('train');
    expect(typing.toCamelCase('calc_l2norm')).to.equal('calcL2norm');

    expect(typing.toCamelCase('foo')).to.equal('foo');
    expect(typing.toCamelCase('Foo')).to.equal('foo');
    expect(typing.toCamelCase('FOO')).to.equal('foo');
    expect(typing.toCamelCase('fOo')).to.equal('fOo');
    expect(typing.toCamelCase('foO')).to.equal('foO');
    expect(typing.toCamelCase('fOO')).to.equal('fOo');
    expect(typing.toCamelCase('foo_bar')).to.equal('fooBar');
    expect(typing.toCamelCase('Foo_Bar')).to.equal('fooBar');
    expect(typing.toCamelCase('FOO_BAR')).to.equal('fooBar');
    expect(typing.toCamelCase('foo-bar')).to.equal('fooBar');
    expect(typing.toCamelCase('foo bar')).to.equal('fooBar');
    expect(typing.toCamelCase('fooBar')).to.equal('fooBar');
    expect(typing.toCamelCase('FooBar')).to.equal('fooBar');

    done();
  });
});

describe('typing#toPascalCase', () => {
  it('sould return upper-camelcase', done => {
    expect(typing.toPascalCase('nearest_neighbor')).to.equal('NearestNeighbor');
    expect(typing.toPascalCase('anomaly')).to.equal('Anomaly');

    expect(typing.toPascalCase('foo')).to.equal('Foo');
    expect(typing.toPascalCase('Foo')).to.equal('Foo');
    expect(typing.toPascalCase('FOO')).to.equal('Foo');
    expect(typing.toPascalCase('fOo')).to.equal('FOo');
    expect(typing.toPascalCase('foO')).to.equal('FoO');
    expect(typing.toPascalCase('fOO')).to.equal('FOo');
    expect(typing.toPascalCase('foo_bar')).to.equal('FooBar');
    expect(typing.toPascalCase('Foo_Bar')).to.equal('FooBar');
    expect(typing.toPascalCase('FOO_BAR')).to.equal('FooBar');
    expect(typing.toPascalCase('foo-bar')).to.equal('FooBar');
    expect(typing.toPascalCase('foo bar')).to.equal('FooBar');
    expect(typing.toPascalCase('fooBar')).to.equal('FooBar');
    expect(typing.toPascalCase('FooBar')).to.equal('FooBar');

    done();
  });
});

describe('typing#toSnakeCase', () => {
  it('sould return snakelcase', done => {
    expect(typing.toSnakeCase('NearestNeighbor')).to.equal('nearest_neighbor');
    expect(typing.toSnakeCase('Anomaly')).to.equal('anomaly');
    expect(typing.toSnakeCase('train')).to.equal('train');
    expect(typing.toSnakeCase('calcL2norm')).to.equal('calc_l2norm');

    expect(typing.toSnakeCase('foo')).to.equal('foo');
    expect(typing.toSnakeCase('Foo')).to.equal('foo');
    expect(typing.toSnakeCase('FOO')).to.equal('foo');
    expect(typing.toSnakeCase('fOo')).to.equal('f_oo');
    expect(typing.toSnakeCase('foO')).to.equal('fo_o');
    expect(typing.toSnakeCase('fOO')).to.equal('f_oo');
    expect(typing.toSnakeCase('foo_bar')).to.equal('foo_bar');
    expect(typing.toSnakeCase('Foo_Bar')).to.equal('foo_bar');
    expect(typing.toSnakeCase('FOO_BAR')).to.equal('foo_bar');
    expect(typing.toSnakeCase('foo-bar')).to.equal('foo_bar');
    expect(typing.toSnakeCase('foo bar')).to.equal('foo_bar');
    expect(typing.toSnakeCase('fooBar')).to.equal('foo_bar');
    expect(typing.toSnakeCase('FooBar')).to.equal('foo_bar');

    done();
  });
});

describe('typing#castTupleConvertibleType', () => {
  it('sould return tuple convertible object', done => {
    const definitions = {
      foo: {
        items: [
          {
            title: 'bar',
            type: 'string'
          },
          {
            title: 'baz',
            type: 'number',
            'default': -1
          }
        ]
      }
    };
    const types = typing.createTupleConvertibleTypes(definitions);
    const cast = (value, schema) => typing.castTupleConvertibleType(value, schema, types);
    expect(cast(0, { type: 'number', definitions })).to.equal(0);
    expect(cast('', { type: 'string', definitions })).to.equal('');
    expect(cast(null, { type: 'null', definitions })).to.equal(null);
    expect(cast(false, { type: 'boolean', definitions })).to.equal(false);
    expect(cast(void 0, { type: 'null', definitions })).to.equal(undefined);
    expect(cast({}, { type: 'object', definitions })).to.deep.equal({});
    expect(cast([], { type: 'array', definitions })).to.deep.equal([]);
    expect(cast([undefined, -1], { '$ref': '#/definitions/foo', definitions })).to.deep.equal(new types.Foo());
    done();
  });
});

describe('typing#toTuple', () => {
  it('sould return tuple', done => {
    expect(typing.toTuple(0)).to.equal(0);
    expect(typing.toTuple('')).to.equal('');
    expect(typing.toTuple(null)).to.equal(null);
    expect(typing.toTuple(false)).to.equal(false);
    expect(typing.toTuple(void 0)).to.equal(undefined);
    expect(typing.toTuple({})).to.deep.equal({});
    expect(typing.toTuple([])).to.deep.equal([]);
    const schema = {
      definitions: {
        foo: {
          items: [
            {
              title: 'bar',
              type: 'string'
            },
            {
              title: 'baz',
              type: 'number',
              'default': -1
            }
          ]
        }
      }
    };
    const types = typing.createTupleConvertibleTypes(schema.definitions);
    const object = new types.Foo();
    expect(typing.toTuple(object)).to.deep.equal(object.toTuple());
    const objects = new Array(2).map(() => new types.Foo());
    expect(typing.toTuple(objects)).to.have.members(objects.map(o => o.toTuple()));
    done();
  });
});

describe('typing#createTupleConvertibleTypes', () => {
  it('sould return tuple convertible type', done => {
    const schema = {
      definitions: {
        foo: {
          items: [
            {
              title: 'bar',
              type: 'string'
            },
            {
              title: 'baz',
              type: 'number',
              'default': -1
            }
          ]
        }
      }
    };
    const types = typing.createTupleConvertibleTypes(schema.definitions);
    expect(types).to.have.property('Foo').that.is.a('function')
      .and.to.have.property('fromTuple').that.is.a('function');
    const Type = types.Foo;
    const object = new Type();
    expect(object).to.be.a('Foo').and.to.have.property('baz', -1);
    expect(object).to.have.property('bar').that.is.a('undefined');
    expect(object).to.have.property('toTuple').that.is.a('function');
    const tuple = object.toTuple();
    expect(tuple).to.be.a('array').to.have.lengthOf(2).and.to.have.members([undefined, -1]);
    expect(Type.fromTuple(tuple)).to.deep.equal(object);
    done();
    });
});