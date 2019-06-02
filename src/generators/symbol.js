import jsc from 'jsverify';
import { anyGenerator } from './any';
import { takeSample } from '../utils';

export function symbolGenerator() {
  return jsc.bless({
    generator: jsc.generator.bless(() => Symbol(takeSample(anyGenerator))),
  });
}

/**
 * ES6 Symbol
 */
export function symbol() {
  return takeSample(symbolGenerator());
}
