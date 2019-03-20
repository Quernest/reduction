import map from "lodash/map";

export const getColumn = <T>(arr: number[][], n: number): T[] =>
  map<any, T>(arr, x => x[n]);

export const insert = <T>(arr: any[], index: number, newItem: any): T[] => [
  // part of the array before the specified index
  ...arr.slice(0, index),
  // inserted item
  newItem,
  // part of the array after the specified index
  ...arr.slice(index)
];
