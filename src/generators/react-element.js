import React from 'react';
import jsc from 'jsverify';
import {
  createGenerator,
  takeSample,
  validHTMLElements,
} from '../utils';


export const htmlElementGenerator = jsc.oneof(validHTMLElements.map(createGenerator));

/**
 * Creates react element with a random html element type
 */
export function reactElement() {
  const element = takeSample(htmlElementGenerator);
  return React.createElement(element, [], `mock <${element}> from props`);
}
