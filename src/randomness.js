/**
 * Manages the level of randomness for jsverify calls
 * see takeSample in the utils file
 */
let RANDOMNESS = 1000;

export function setRandomness(randomness) {
  if (typeof randomness === 'number') {
    RANDOMNESS = randomness;
    return RANDOMNESS;
  }
  const error = new Error('error: randomness must be a number');
  throw error;
}

export function getRandomness() {
  return RANDOMNESS;
}
