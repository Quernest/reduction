import isArray from "lodash/isArray";
import map from "lodash/map";

// recursive function
export const opposite = (value: any[] | number): any[] | number => {
  if (!value) {
    return value;
  }

  if (isArray(value)) {
    return map(value, opposite);
  }

  return -value;
};

export const getMatrixColumn = (matrix: number[][], n: number) =>
  map(matrix, (x: number[]) => x[n]);
