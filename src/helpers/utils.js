// @flow

const transformDatasetToPoints = (dataset, axes = ['x', 'y']): Array<{ x: number, y: number }> => {
  const points: Array<{ x: number, y: number }> = [];

  for (let i = 0; i < dataset.length; i += 1) {
    for (let j = 0; j < dataset[i].length; j += 1) {
      if (typeof points[j] === 'undefined') {
        points[j] = {};
      }

      points[j][axes[i]] = dataset[i][j];
    }
  }

  return points;
};

export { transformDatasetToPoints };
