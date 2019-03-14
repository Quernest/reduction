import map from "lodash/map";

export const getColumn = <T>(arr: number[][], n: number): T[] =>
  map<any, T>(arr, x => x[n]);
