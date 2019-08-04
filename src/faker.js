import jsc from 'jsverify';
import parsePropTypes from 'parse-prop-types';
import { setRandomness } from './randomness';
import { takeSample } from './utils';

import { reactElement, htmlElementGenerator } from './generators/react-element';
import { anyGenerator, any } from './generators/any';
import { symbol } from './generators/symbol';

/**
 * Fake functions for each propType are given here.
 * The return value is the fake value.
 */
function getFakeAny() {
  return any();
}

function getFakeArray() {
  return takeSample(jsc.nearray(anyGenerator));
}

function getFakeBoolean() {
  return takeSample(jsc.bool);
}

function getFakeCustom() {
  return 'error: custom propTypes are not supported';
}

function getFakeElement() {
  return reactElement();
}

function getFakeElementType() {
  return reactElement().type;
}

function getFakeFunction() {
  return takeSample(jsc.fun(anyGenerator));
}

function getFakeInstanceOf() {
  return 'error: instanceOf propType is not supported';
}

function getFakeNode() {
  return takeSample(jsc.oneof(
    htmlElementGenerator,
    jsc.array,
    jsc.constant(false),
    jsc.constant(reactElement()),
    jsc.number,
    jsc.string,
  ));
}

function getFakeNumber() {
  return takeSample(jsc.nat);
}

function getFakeObject() {
  return takeSample(jsc.dict(anyGenerator));
}

function getFakeString() {
  return takeSample(jsc.string);
}

function getFakeSymbol() {
  return symbol();
}

function getFakeArrayOf(childProps) {
  // childProps /*?*/
  return Object.entries(childProps).reduce((acc, [key, prop]) => [
    // eslint-disable-next-line no-use-before-define
    ...acc, parsePropType({ type: { [key]: prop } }),
  ], []);
}

function getFakeOneOf(elements) {
  const constants = elements.map(jsc.constant);
  return takeSample(jsc.oneof(constants));
}

function getFakeShape(childProps) {
  return Object.entries(childProps).reduce((acc, [key, prop]) => ({
    // eslint-disable-next-line no-use-before-define
    ...acc, [key]: parsePropType(prop),
  }), {});
}

/**
 * Filters out the non-required propTypes 50% of
 * the time by returning null
 *
 * @param {Object} prop
 * @returns {Object|null}
 */
function filterRequiredProps(prop) {
  const { required } = prop;

  if (required === true) return prop;

  return jsc.random(0, 1) === 0 ? prop : null;
}

function parsePropType(originalProp, useRequired = true) {
  let prop = originalProp;
  if (!useRequired) {
    prop = filterRequiredProps(prop);

    if (!prop) return null;
  }

  switch (prop.type.name) {
    case 'any':
      return getFakeAny();
    case 'array':
      return getFakeArray();
    case 'bool':
      return getFakeBoolean();
    case 'custom':
      return getFakeCustom();
    case 'element':
      return getFakeElement();
    case 'elementType':
      return getFakeElementType();
    case 'func':
      return getFakeFunction();
    case 'number':
      return getFakeNumber();
    case 'object':
      return getFakeObject();
    case 'string':
      return getFakeString();
    case 'symbol':
      return getFakeSymbol();
    case 'node':
      return getFakeNode();
    case 'arrayOf':
      return getFakeArrayOf(prop.type.value);
    case 'instanceOf':
      return getFakeInstanceOf();
    case 'oneOf':
      return getFakeOneOf(prop.type.value);
    case 'oneOfType':
      return getFakeArrayOf.apply(this, prop.type.value);
    case 'shape':
      return getFakeShape(prop.type.value);
    default:
      return `error: prop type ${prop.type.name} not supported`;
  }
}

function isEmptyComponent(component) {
  if (!component
    || Object.entries(component).length === 0) {
    return true;
  }
  return false;
}

/**
 * External Public API
 * @param reactComponent
 * @param {Object} options optional flags for the generator
 * @param {clean|mixed|corrupt} [options.state=clean] Whether to inject bad data
 * @param {number} [options.randomness=1000] How random you want the data, large values take longer
 * @param {boolean} [options.required=true] Whether to use all non-required keys
 */
export default function (reactComponent = {}, options = {}) {
  const {
    // TODO: implement later
    // eslint-disable-next-line no-unused-vars
    state = 'clean',
    randomness = 1000,
    required = true,
  } = options;

  if (isEmptyComponent(reactComponent)) {
    return 'error: provide a React component to generateFake';
  }

  // set the randomness globally for all child functions
  setRandomness(randomness);

  const propTypes = parsePropTypes(reactComponent, required);

  return Object.entries(propTypes).reduce((acc, [key, prop]) => ({
    ...acc, ...{ [key]: parsePropType(prop) },
  }),
  {});
}
