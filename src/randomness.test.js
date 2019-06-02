import { property } from 'jsverify';
import { getRandomness, setRandomness } from './randomness';

describe('src/randomness', () => {
  afterEach(() => {
    setRandomness(1000);
  });

  describe('setRandomness', () => {
    property('error thrown when randomness not a number', 'bool', (badRandom) => {
      try {
        const out = setRandomness(badRandom);
        return out === false;
      } catch (error) {
        return error.message === 'error: randomness must be a number';
      }
    });

    property('returns the randomness given', 'number',
      randomness => setRandomness(randomness) === randomness);
  });

  describe('getRandomness', () => {
    property('returns the current randomness level',
      () => {
        const defaultRandomness = getRandomness();
        setRandomness(1);
        const customRandomness = getRandomness();

        return (
          defaultRandomness === 1000
          && customRandomness === 1
        );
      });
  });
});
