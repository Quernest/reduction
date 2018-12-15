import PCA from './PCA';

self.addEventListener(
  'message',
  (ev) => {
    const { data } = ev;

    // TODO: add validation
    const pca = new PCA(data);

    const {
      covariance,
      analysis,
      scatterPoints,
      eigens,
      linearCombinations,
      normalizedDataset,
    } = pca;

    const calculations = {
      covariance,
      analysis,
      scatterPoints,
      eigens,
      linearCombinations,
      normalizedDataset,
    };

    self.postMessage(calculations);
  },
  false,
);
