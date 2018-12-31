/* global FileReader */
import forEach from 'lodash/forEach';
import some from 'lodash/some';
import size from 'lodash/size';
import isEmpty from 'lodash/isEmpty';
import isNaN from 'lodash/isNaN';
import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';
import CSV from '../../utils/csv';

if (!isUndefined(self)) {
  self.addEventListener('message', (ev) => {
    const { data } = ev;

    const fr = new FileReader();

    fr.readAsText(data);

    fr.onload = () => {
      const { result } = fr;

      const csv = CSV.parse(result);

      console.log('csv file:', csv); // eslint-disable-line

      // is not permitted:
      // empty csv files
      if (isEmpty(csv)) {
        throw new Error('parsed csv is empty');
      }

      forEach(csv, (obj) => {
        // objects that contains less than 2 factors
        if (size(obj) < 2) {
          throw new Error(
            'the object of dataset must contain more than 2 factors.',
          );
        }

        // String and NaN values
        const hasIncorrectValue = value => isNaN(value) || isString(value);

        if (some(obj, hasIncorrectValue)) {
          throw new Error('the dataset has some wrong values');
        }
      });

      self.postMessage(csv);
    };

    fr.onerror = error => self.postMessage(error);
  });
}
