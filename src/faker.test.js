/* eslint-disable react/forbid-foreign-prop-types */
import React from 'react';
import propTypes from 'prop-types';
import jsc, { property } from 'jsverify';
import * as faker from './faker';
import { validHTMLElements } from './utils';
import { setRandomness } from './randomness';

jest.mock('./randomness');

describe('src/faker.js', () => {
  describe('generateFake', () => {
    let element;
    const positiveIntegersArb = jsc.nat.smap(
      x => x + 1,
      x => x - 1,
    );

    function comparePropLength(el, fakeProps) {
      return (
        // eslint-disable-next-line react/forbid-foreign-prop-types
        Object.entries(el.propTypes).length
        === Object.entries(fakeProps).length
      );
    }

    beforeEach(() => {
      element = () => React.createElement('div', [], '');
      element.propTypes = {
        foo: propTypes.string.isRequired,
        bar: propTypes.bool,
      };

      jest.resetAllMocks();
    });

    property('error returned when no component is given',
      jsc.oneof(
        jsc.constant(null),
        jsc.constant({}),
        jsc.constant(''),
        jsc.constant(undefined),
      ),
      (emptyComponent) => {
        const result = faker.generateFake(emptyComponent);

        return result === 'error: provide a React component to generateFake';
      });

    property('uses the given randomness option', positiveIntegersArb, (randomness) => {
      faker.generateFake(element, { randomness });

      // HACK: interop problem with jest + jsverify :/
      const { calls } = setRandomness.mock;
      const lastCall = calls[calls.length - 1][0];
      return randomness === lastCall;
    });

    property('required props always return', () => {
      delete element.propTypes.bar;
      const props = faker.generateFake(element, { required: false });
      return typeof props.foo === 'string';
    });

    property('non-required props can return null', () => {
      delete element.propTypes.foo;
      const props = faker.generateFake(element, { required: false });
      return props.bar === null || typeof props.bar === 'boolean';
    });

    property('returns a propType for each propType given', () => {
      const twoProps = faker.generateFake(element);

      const onePropElement = {};
      onePropElement.propTypes = {
        foo: propTypes.bool,
      };

      const oneProp = faker.generateFake(onePropElement);

      return (
        comparePropLength(element, twoProps)
        && comparePropLength(onePropElement, oneProp)
      );
    });
  });

  describe('parsePropType', () => {
    function makePropType(name, required) {
      return { type: { name }, required };
    }

    property('unexpected prop types have an error message', () => {
      const error = faker.parsePropType({ type: {} });
      return error === 'error: prop type undefined not supported';
    });

    property('required props return the propType',
      jsc.oneof(
        jsc.constant('string'),
        jsc.constant('bool'),
        jsc.constant('number'),
      ),
      (type) => {
        const prop = makePropType(type, true);
        const value = faker.parsePropType(prop, false);

        return typeof value === 'string'
          || typeof value === 'boolean'
          || typeof value === 'number';
      });

    property('non-required props can return null',
      jsc.oneof(
        jsc.constant('string'),
        jsc.constant('bool'),
        jsc.constant('number'),
      ),
      (type) => {
        const prop = makePropType(type, false);
        const value = faker.parsePropType(prop, false);

        return value === null
          || typeof value === 'string'
          || typeof value === 'boolean'
          || typeof value === 'number';
      });

    property('expected prop types return values',
      jsc.oneof(
        jsc.constant('any'),
        jsc.constant('array'),
        jsc.constant('bool'),
        jsc.constant('custom'),
        jsc.constant('element'),
        jsc.constant('func'),
        jsc.constant('number'),
        jsc.constant('object'),
        jsc.constant('string'),
        jsc.constant('symbol'),
        jsc.constant('node'),
      ),
      (type) => {
        const value = faker.parsePropType({ type: { name: type } });
        return value !== null;
      });

    // jest spyOn doesn't work well here...
    property('returns array of propTypes for arrayOf and oneOfType',
      jsc.oneof(
        jsc.constant('arrayOf'),
        jsc.constant('oneOfType'),
      ),
      (type) => {
        const prop = {
          type: {
            name: type,
            value: {
              foo: { type: { name: 'bool' }, required: true },
            },
          },
        };

        const value = faker.parsePropType(prop);

        return (
          Array.isArray(value)
          && typeof value[0].foo === 'boolean'
        );
      });

    property('calls getFakeInstanceOf for propType instanceOf', () => {
      const value = faker.parsePropType({ type: { name: 'instanceOf' } });

      return value === 'error: instanceOf propType is not supported';
    });

    property('calls getFakeOneOf for propType oneOf', () => {
      const prop = {
        type: {
          name: 'oneOf',
          value: ['bool'],
        },
      };
      const value = faker.parsePropType(prop);

      return value === 'bool';
    });

    property('calls getFakeShape for propType shape', () => {
      const prop = {
        type: {
          name: 'shape',
          value: {
            foo: { type: { name: 'bool' }, required: true },
          },
        },
      };

      const [value] = faker.parsePropType(prop);

      return typeof value === 'boolean';
    });
  });

  describe('getFakeAny', () => {
    property('is anything', () => {
      const anything = faker.getFakeAny();
      return anything !== null && anything !== undefined;
    });
  });

  describe('getFakeArray', () => {
    property('is an array', () => Array.isArray(faker.getFakeArray()));
  });

  describe('getFakeBoolean', () => {
    property('is a boolean', () => typeof faker.getFakeBoolean() === 'boolean');
  });

  describe('getFakeCustom', () => {
    property('is an error message', () => (
      faker.getFakeCustom()
      === 'error: custom propTypes are not supported'
    ));
  });

  describe('getFakeElement', () => {
    property('is a React Element', () => {
      const element = faker.getFakeElement();
      return typeof element.$$typeof === 'symbol';
    });
  });

  describe('getFakeElementType', () => {
    property('is a valid html element type', () => {
      const validElements = new Set(validHTMLElements);
      const type = faker.getFakeElementType();

      return validElements.has(type);
    });
  }); describe('getFakeFunction', () => {
    property('is a function', () => typeof faker.getFakeFunction() === 'function');
  });

  describe('getFakeInstanceOf', () => {
    property('is an error message', () => (
      faker.getFakeInstanceOf()
      === 'error: instanceOf propType is not supported'
    ));
  });

  describe('getFakeNode', () => {
    // lots of possible types
    property('does not return null', () => faker.getFakeNode() !== null);
  });

  describe('getFakeNumber', () => {
    property('is a number', () => typeof faker.getFakeNumber() === 'number');
  });

  describe('getFakeObject', () => {
    property('is an object', () => typeof faker.getFakeObject() === 'object');
  });

  describe('getFakeString', () => {
    property('is a string', () => typeof faker.getFakeString() === 'string');
  });

  describe('getFakeSymbol', () => {
    property('is a symbol', () => typeof faker.getFakeSymbol() === 'symbol');
  });

  describe('getFakeArrayOf', () => {
    function buildTypeMap(key, name) {
      return { [key]: { type: { name } } };
    }

    property('key names are preserved',
      'nearray nestring', (keys) => {
        const allKeys = new Set(keys);
        const typeMap = keys.reduce((acc, key) => ({
          ...acc, ...buildTypeMap(key, 'string'),
        }), {});

        return Object.keys(typeMap)
          .every(key => allKeys.has(key));
      });

    property('types returned are in the propType arrayOf', () => {
      const [{ foo }] = faker.getFakeArrayOf({ foo: { type: { name: 'bool' } } });
      const [{ bar }] = faker.getFakeArrayOf({ bar: { type: { name: 'number' } } });

      return (
        typeof foo === 'boolean'
        && typeof bar === 'number'
      );
    });
  });

  describe('getFakeOneOf', () => {
    property('selects from the choices', jsc.nearray(jsc.nat), (nats) => {
      const elementSet = new Set(nats);
      const element = faker.getFakeOneOf(nats);
      return elementSet.has(element);
    });
  });

  describe('getFakeShape', () => {
    function buildChildMap(name) {
      const randomKey = `${Math.random()}`;
      return { [randomKey]: { type: { name }, required: true } };
    }

    property('childProp type should match result type', () => {
      const boolProps = buildChildMap('bool');
      const numTypes = buildChildMap('number');

      const boolTypes = faker.getFakeShape(boolProps);
      const numberTypes = faker.getFakeShape(numTypes);

      return (
        boolTypes.every(type => typeof type === 'boolean')
        && numberTypes.every(type => typeof type === 'number')
      );
    });
  });
});
