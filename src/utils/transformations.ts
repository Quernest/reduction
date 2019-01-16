import transform from 'lodash/transform';
import values from 'lodash/values';
import isUndefined from 'lodash/isUndefined';
import forEach from 'lodash/forEach';

export const transformArrayOfObjectsTo2DArray = (arr: object[]): [][] => {
  const transformer = (accumulator: number[][], current: object) => {
    values(current).forEach((value: number, i: number) => {
      (accumulator[i] || (accumulator[i] = [])).push(value);
    });
  };

  return transform(arr, transformer, []);
};

export const transform2DArrayToArrayOfObjects = (
  arr: [][],
  keys: string[] = ['x', 'y', 'z'],
): object[] => {
  const transformer = (accumulator: [][], current: any[], i: number) => {
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
};
