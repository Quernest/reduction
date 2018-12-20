import PCA from '../PCA';

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
