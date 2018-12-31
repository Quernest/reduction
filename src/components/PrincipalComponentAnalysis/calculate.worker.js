import isUndefined from 'lodash/isUndefined';
import PCA from './PCA';

if (!isUndefined(self)) {
  self.addEventListener(
    'message',
    (ev) => {
      const { data } = ev;

      const pca = new PCA(data);

      const {
        covariance,
        analysis,
        scatterPoints,
        eigens,
        linearCombinations,
        adjustedDataset,
        names,
      } = pca;

      const calculations = {
        covariance,
        analysis,
        scatterPoints,
        eigens,
        linearCombinations,
        adjustedDataset,
        names,
      };

      console.group('Calculations'); // eslint-disable-line

      Object.keys(calculations).map((key) => {
        console.log(key, calculations[key]); // eslint-disable-line

        return key;
      });

      console.groupEnd('Calculations'); // eslint-disable-line

      self.postMessage(calculations);
    },
    false,
  );
}
