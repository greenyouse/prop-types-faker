/* eslint-disable react/require-default-props */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/forbid-foreign-prop-types */
import React from 'react';
import propTypes from 'prop-types';
import jsc, { property } from 'jsverify';
import generateFake from './faker';
import { validHTMLElements } from './utils';
import { setRandomness } from './randomness';

jest.mock('./randomness');

describe('src/faker.js', () => {
  let element;
  beforeEach(() => {
    jest.resetAllMocks();
    element = () => React.createElement('div', [], '');
    element.propTypes = {
      foo: propTypes.string.isRequired,
      bar: propTypes.bool,
    };
  });

  describe('generateFake', () => {
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

    property('error returned when no component is given',
      jsc.oneof(
        jsc.constant(null),
        jsc.constant({}),
        jsc.constant(''),
        jsc.constant(undefined),
      ),
      (emptyComponent) => {
        const result = generateFake(emptyComponent);

        return result === 'error: provide a React component to generateFake';
      });

    property('uses the given randomness option', positiveIntegersArb, (randomness) => {
      generateFake(element, { randomness });

      // HACK: interop problem with jest + jsverify :/
      const { calls } = setRandomness.mock;
      const lastCall = calls[calls.length - 1][0];
      return randomness === lastCall;
    });

    property('required props always return', () => {
      delete element.propTypes.bar;
      const props = generateFake(element, { required: false });
      return typeof props.foo === 'string';
    });

    property('non-required props can return null', () => {
      delete element.propTypes.foo;
      const props = generateFake(element, { required: false });
      return props.bar === null || typeof props.bar === 'boolean';
    });

    property('returns a propType for each propType given', () => {
      const twoProps = generateFake(element);

      const onePropElement = {};
      onePropElement.propTypes = {
        foo: propTypes.bool,
      };

      const oneProp = generateFake(onePropElement);

      return (
        comparePropLength(element, twoProps)
        && comparePropLength(onePropElement, oneProp)
      );
    });
  });

  describe('parsePropType', () => {
    property('non-required props can return null',
      jsc.oneof(
        jsc.constant('string'),
        jsc.constant('bool'),
        jsc.constant('number'),
      ),
      (type) => {
        element.propTypes = {
          foo: propTypes[type],
        };

        const props = generateFake(element);

        return props.foo === null
          || typeof props.foo === 'string'
          || typeof props.foo === 'boolean'
          || typeof props.foo === 'number';
      });
  });

  describe('getFakeAny', () => {
    property('is anything', () => {
      element.propTypes = {
        foo: propTypes.any.isRequired,
      };


      const props = generateFake(element);
      return props.foo !== null && props.foo !== undefined;
    });
  });

  describe('getFakeArray', () => {
    property('is an array', () => {
      element.propTypes = {
        foo: propTypes.array.isRequired,
      };

      const props = generateFake(element);
      return Array.isArray(props.foo);
    });
  });

  describe('getFakeBoolean', () => {
    property('is a boolean', () => {
      element.propTypes = {
        foo: propTypes.bool.isRequired,
      };

      const props = generateFake(element);
      return typeof props.foo === 'boolean';
    });
  });

  describe('getFakeCustom', () => {
    property('is an error message', () => {
      element.propTypes = {
        // eslint-disable-next-line consistent-return
        foo(props, propName, componentName) {
          if (!/matchme/.test(props[propName])) {
            return new Error(
              `Invalid prop \`${propName}\` supplied to\
            \`${componentName}\`. Validation failed.`,
            );
          }
        },
      };

      const props = generateFake(element);
      return props.foo === 'error: custom propTypes are not supported';
    });
  });

  describe('getFakeElement', () => {
    property('is a React Element', () => {
      element.propTypes = {
        foo: propTypes.element.isRequired,
      };

      const props = generateFake(element);

      return typeof props.foo.$$typeof === 'symbol';
    });
  });

  describe('getFakeElementType', () => {
    property('is a valid html element type', () => {
      element.propTypes = {
        foo: propTypes.elementType.isRequired,
      };

      const props = generateFake(element);
      const validElements = new Set(validHTMLElements);

      return validElements.has(props.foo);
    });
  });

  describe('getFakeFunction', () => {
    property('is a function', () => {
      element.propTypes = {
        foo: propTypes.func.isRequired,
      };

      const props = generateFake(element);

      return typeof props.foo === 'function';
    });
  });

  describe('getFakeInstanceOf', () => {
    property('is an error message', () => {
      element.propTypes = {
        foo: propTypes.instanceOf(element).isRequired,
      };

      const props = generateFake(element);

      return props.foo === 'error: instanceOf propType is not supported';
    });
  });

  describe('getFakeNode', () => {
    // lots of possible types
    property('does not return null', () => {
      element.propTypes = {
        foo: propTypes.node.isRequired,
      };

      const props = generateFake(element);

      return props.foo !== null;
    });
  });

  describe('getFakeNumber', () => {
    property('is a number', () => {
      element.propTypes = {
        foo: propTypes.number.isRequired,
      };

      const props = generateFake(element);

      return typeof props.foo === 'number';
    });
  });

  describe('getFakeObject', () => {
    property('is an object', () => {
      element.propTypes = {
        foo: propTypes.object.isRequired,
      };

      const props = generateFake(element);

      return typeof props.foo === 'object';
    });
  });

  describe('getFakeString', () => {
    property('is a string', () => {
      element.propTypes = {
        foo: propTypes.string.isRequired,
      };

      const props = generateFake(element);

      return typeof props.foo === 'string';
    });
  });

  describe('getFakeSymbol', () => {
    property('is a symbol', () => {
      element.propTypes = {
        foo: propTypes.symbol.isRequired,
      };

      const props = generateFake(element);

      return typeof props.foo === 'symbol';
    });
  });

  describe('getFakeArrayOf', () => {
    property('types returned are in the propType arrayOf', () => {
      element.propTypes = {
        foo: propTypes.arrayOf(propTypes.bool).isRequired,
        bar: propTypes.arrayOf(propTypes.number).isRequired,
      };

      const props = generateFake(element);

      return (
        props.foo.every(el => typeof el === 'boolean')
        && props.bar.every(el => typeof el === 'number')
      );
    });
  });

  describe('getFakeOneOf', () => {
    property('selects from the choices', jsc.nearray(jsc.nat), (nats) => {
      element.propTypes = {
        foo: propTypes.oneOf(nats).isRequired,
      };

      const props = generateFake(element);

      const elementSet = new Set(nats);
      return elementSet.has(props.foo);
    });
  });


  describe('getFakeOneOfType', () => {
    property('types returned are in the propType instanceOf',
      jsc.oneof(
        jsc.constant('string'),
        jsc.constant('number'),
        jsc.constant('bool'),
      ), (type) => {
        element.propTypes = {
          foo: propTypes.oneOfType([
            propTypes[type].isRequired,
          ]).isRequired,
        };

        const props = generateFake(element);

        return (
          props.foo.every(el => typeof el === 'string')
          || props.foo.every(el => typeof el === 'number')
          || props.foo.every(el => typeof el === 'boolean')
        );
      });
  });

  describe('getFakeShape', () => {
    property('childProp type should match result type', () => {
      element.propTypes = {
        foo: propTypes.shape({
          baz: propTypes.bool.isRequired,
        }).isRequired,
        bar: propTypes.shape({
          quxx: propTypes.number.isRequired,
        }).isRequired,
      };

      const props = generateFake(element);

      return (
        typeof props.foo.baz === 'boolean'
        && typeof props.bar.quxx === 'number'
      );
    });
  });
});
