import isArray from 'lodash/isArray';
import map from 'lodash/map';

// recursive function
export const opposite = (value: Array<any> | number): any => {
  if (!value) {
    return value;
  }

  if (isArray(value)) {
    return map(value, opposite);
  }

  return -value;
};
