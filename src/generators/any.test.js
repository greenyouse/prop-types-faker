import { property } from 'jsverify';
import { any } from './any';

describe('src/generators/any.js', () => {
  property('any is a string, character, or natural number', () => {
    const resultType = typeof any();

    return (
      resultType === 'string'
      || resultType === 'number'
    );
  });
});
