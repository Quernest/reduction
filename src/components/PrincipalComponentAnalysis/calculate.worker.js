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

      self.postMessage(calculations);
    },
    false,
  );
}
