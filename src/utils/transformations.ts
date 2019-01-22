import forEach from "lodash/forEach";
import isUndefined from "lodash/isUndefined";
import transform from "lodash/transform";
import values from "lodash/values";

/**
 * transforms object collection to the two-dimensional array
 * @param arr array of objects
 */
export function to2D(arr: object[]): any[][] {
  const transformer = (accumulator: any[], current: object) => {
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
export function from2D<T>(arr: any[][], keys: string[] = ["x", "y"]): T[] {
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
