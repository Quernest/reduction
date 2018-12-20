import {
  forEach, some, size, isEmpty, isNaN, isString,
} from 'lodash';
import CSV from '../../../utils/csv';

self.addEventListener('message', async (ev) => {
  const { data } = ev;

  const fr = new FileReader();

  fr.readAsText(data);

  fr.onload = () => {
    const { result } = fr;

    const csv = CSV.parse(result);

    // is not permitted:
    // empty csv files
    if (isEmpty(csv)) {
      throw new Error('parsed csv is empty');
    }

    forEach(csv, (obj) => {
      // objects that contains less than 2 factors
      if (size(obj) < 2) {
        throw new Error('the object of dataset must contain more than 2 factors.');
      }

      // String and NaN values
      const hasIncorrectValue = value => isNaN(value) || isString(value);

      if (some(obj, hasIncorrectValue)) {
        throw new Error('the dataset has some wrong values');
      }
    });

    postMessage(csv);
  };

  fr.onerror = error => postMessage(error);
});
