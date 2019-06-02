import jsc from 'jsverify';
import { takeSample } from '../utils';

const anyTypes = [
  jsc.string,
  jsc.char,
  jsc.nat,
];

export const anyGenerator = jsc.oneof(...anyTypes);

/**
 * any is for common array or object elements like
 * strings, natural numbers, and characters
 */
export function any() {
  return takeSample(anyGenerator);
}
