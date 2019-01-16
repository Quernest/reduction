import transform = require('lodash/transform');
import values = require('lodash/values');
import isUndefined = require('lodash/isUndefined');
import forEach = require('lodash/forEach');

// transforms object collection to the two-dimensional array
export function to2D(arr: object[]): any[][] {
  const transformer = (accumulator: any[], current: any) => {
    values(current).forEach((value: any, i: number) => {
      (accumulator[i] || (accumulator[i] = [])).push(value);
    });
  };

  return transform(arr, transformer, []);
}

// transforms two-dimensional array to the object collection
export function from2D(
  arr: any[][],
  keys: string[] = ['x', 'y', 'z'],
): object[] {
  const transformer = (accumulator: any[], current: any[], i: number) => {
    forEach(current, (_, j: number) => {
      if (isUndefined(accumulator[j])) {
        accumulator[j] = {};
      }

      if (!isUndefined(keys[i])) {
        accumulator[j][keys[i]] = current[j];
      }
    });

    return accumulator;
  };

  return transform(arr, transformer, []);
}
