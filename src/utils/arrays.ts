import map from "lodash/map";

export const getColumn = (arr: number[][], n: number) =>
  map(arr, (x: number[]) => x[n]);
