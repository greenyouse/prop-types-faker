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
export function getFakeAny() {
  return any();
}

export function getFakeArray() {
  return takeSample(jsc.nearray(anyGenerator));
}

export function getFakeBoolean() {
  return takeSample(jsc.bool);
}

export function getFakeCustom() {
  return 'error: custom propTypes are not supported';
}

export function getFakeElement() {
  return reactElement();
}

export function getFakeElementType() {
  return reactElement().type;
}

export function getFakeFunction() {
  return takeSample(jsc.fun(anyGenerator));
}

export function getFakeInstanceOf() {
  return 'error: instanceOf propType is not supported';
}

export function getFakeNode() {
  return takeSample(jsc.oneof(
    htmlElementGenerator,
    jsc.array,
    jsc.constant(false),
    jsc.constant(reactElement()),
    jsc.number,
    jsc.string,
  ));
}

export function getFakeNumber() {
  return takeSample(jsc.nat);
}

export function getFakeObject() {
  return takeSample(jsc.dict(anyGenerator));
}

export function getFakeString() {
  return takeSample(jsc.string);
}

export function getFakeSymbol() {
  return symbol();
}
export function getFakeArrayOf(childProps) {
  // childProps /*?*/
  return Object.entries(childProps).reduce((acc, [key, prop]) => [
    // eslint-disable-next-line no-use-before-define
    ...acc, { [key]: parsePropType(prop) },
  ], []);
}

export function getFakeOneOf(elements) {
  const constants = elements.map(jsc.constant);
  return takeSample(jsc.oneof(constants));
}

export function getFakeShape(childProps) {
  // eslint-disable-next-line no-use-before-define
  return Object.values(childProps).map(parsePropType);
}

/**
 * Filters out the non-required propTypes 50% of
 * the time by returning null
 *
 * @param {Object} prop
 * @returns {Object|null}
 */
export function filterRequiredProps(prop) {
  const { required } = prop;

  if (required === true) return prop;

  return jsc.random(0, 1) === 0 ? prop : null;
}

export function parsePropType(originalProp, useRequired = true) {
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
      return getFakeArrayOf(prop.type.value);
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
export function generateFake(reactComponent = {}, options = {}) {
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
