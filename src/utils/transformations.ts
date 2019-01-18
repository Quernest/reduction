import transform = require("lodash/transform");
import values = require("lodash/values");
import isUndefined = require("lodash/isUndefined");
import forEach = require("lodash/forEach");

export interface IObject {
  [x: string]: any;
}

/**
 * transforms object collection to the two-dimensional array
 * @param arr array of objects { [x: string]: any }
 */
export function to2D(arr: IObject[]): any[][] {
  const transformer = (accumulator: any[], current: IObject) => {
    values(current).forEach((value: any, i: number) => {
      (accumulator[i] || (accumulator[i] = [])).push(value);
    });
  };

  return transform(arr, transformer, []);
}

/**
 * transforms two-dimensional array to the object collection
 * @param arr 2D array (matrix)
 * @param keys array of keys that will be the props of the object
 */
export function from2D(arr: any[][], keys: string[] = ["x", "y"]): IObject[] {
  const transformer = (accumulator: any[], current: any[], i: number) => {
    forEach(current, (_: any, j: number) => {
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
