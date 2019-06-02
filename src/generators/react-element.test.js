import { property } from 'jsverify';
import { reactElement } from './react-element';
import { validHTMLElements } from '../utils';

describe('src/generators/react-element', () => {
  property('element is a react element', () => {
    const element = reactElement();

    // basic check that it's a React element
    return typeof element.$$typeof === 'symbol';
  });

  property('element uses a valid html element type', () => {
    const validElements = new Set(validHTMLElements);

    const { type } = reactElement();

    return validElements.has(type);
  });
});
