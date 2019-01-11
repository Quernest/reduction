// @flow
import isArray from 'lodash/isArray';
import map from 'lodash/map';

export const opposite = (
  value: number | Array<number> | Array<number[]>,
): number => {
  if (!value) {
    return value;
  }

  if (isArray(value)) {
    return map(value, opposite);
  }

  return -value;
};
