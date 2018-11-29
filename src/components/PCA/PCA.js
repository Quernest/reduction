// @flow
// Math.js is an extensive math library for JavaScript and Node.js.
import * as math from 'mathjs';

// lib computes the covariance between one or more numeric arrays.
import cov from 'compute-covariance';

// library for formatting and manipulating numbers.
import numeric from 'numeric';

try {
  math.import(numeric, { wrap: true, silent: true });
} catch (error) {
  throw new Error(
    'To use numeric.js, the library must be installed first via "npm install numeric"',
  );
}

// Principal Component Analysis class
class PCA {
  constructor(dataset: Array<number[]> | Array<Object>) {
    // handle empty dataset
    if (!dataset || (dataset && dataset.length) === 0) {
      throw new Error('No dataset found!');
    }

    // original dataset
    this.dataset = dataset;

    const [element] = this.dataset;

    // check whether the transferred data to the required type Array<number[]>
    // if not, transform into a two-dimensional array.
    if (!Array.isArray(element)) {
      this.dataset = this.transformTo2DArray(dataset);
    }

    // If some variables have a large variance and some small,
    // PCA (maximizing variance) will load on the large variances.
    this.normalizedDataset = this.normalize(this.dataset);

    // points of dataset to plot scatter
    this.points = this.getPoints(this.normalizedDataset);

    // a covariance matrix (also known as dispersion matrix or variance–covariance matrix)
    // is a matrix whose element in the i, j position is the covariance
    // between the i-th and j-th elements of a random vector.
    this.covariance = this.computeCovariance(this.normalizedDataset);

    // a linear transformation is a non-zero vector that changes
    // by only a scalar factor when that linear transformation is applied to it.
    this.eigens = this.getEigens(this.covariance);

    // If one vector is equal to the sum of scalar multiples of other vectors,
    // it is said to be a linear combination of the other vectors.
    this.linearCombinations = undefined;

    // analysis. How {PC1, PC2 ... PCn} accounts of the total variation around the PCs.
    this.analysis = this.analyze(this.eigens.lambda.x);
  }

  // step 1
  normalize = (dataset: Array<number[]>): Array<number[]> => dataset.map((data: Array<number>) => {
    const mean: number = math.mean(data);
    const variance: number = math.var(data);

    return data.map((value: number): number => (value - mean) / math.sqrt(variance));
  });

  // step 2
  computeCovariance = (dataset: Array<number[]>): Array<number[]> => cov(dataset);

  // step 3-4
  getEigens = (
    covariance: Array<number[]>,
  ): {
    // eigenvectors
    lambda: {
      x: Array<number[]>,
      y: Array<number[]>,
    },
    // eigenvalues
    E: {
      x: Array<number>,
      y: Array<number>,
    },
  } => {
    if (!math.eig) {
      throw new Error(
        'Numeric.js is required, the library must be installed first via "npm install numeric"',
      );
    }

    const matrix = math.matrix(covariance);

    return math.eval(`eig(${matrix})`);
  };

  // step 5
  getLinearCombinations = (): void => undefined;

  // step 6
  analyze = (eigenvalues) => {
    const total = math.sum(eigenvalues);

    return eigenvalues.map(l => parseFloat(((l / total) * 100).toFixed(2)));
  };

  // optional you can add 'z' axis
  getPoints = (dataset, axes = ['x', 'y']): Array<{ x: number, y: number }> => {
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

  transformTo2DArray = (data): Array<number[]> => data.reduce((acc, curr) => {
    Object.values(curr).forEach((value, i) => {
      if (typeof acc[i] === 'undefined') {
        acc[i] = [];
      }

      acc[i].push(value);
    });

    return acc;
  }, []);
}

export default PCA;
