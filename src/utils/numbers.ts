import isArray = require('lodash/isArray');
import map = require('lodash/map');

// recursive function
export const opposite = (value: Array<any> | number): Array<any> | number => {
  if (!value) {
    return value;
  }

  if (isArray(value)) {
    return map(value, opposite);
  }

  return -value;
};
