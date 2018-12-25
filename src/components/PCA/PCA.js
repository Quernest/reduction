/**
 * @flow
 * Math.js is an extensive math library for JavaScript and Node.js.
 */
import * as math from 'mathjs';

// utility library delivering modularity, performance & extras.
import {
  sum,
  map,
  reduce,
  transform,
  values,
  keys,
  forEach,
  round,
  isArray,
  isEmpty,
  isUndefined,
} from 'lodash';

// lib computes the covariance between one or more numeric arrays.
import cov from 'compute-covariance';

// library for formatting and manipulating numbers.
import numeric from 'numeric';

// helpers
import { opposite } from '../../utils/num';

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
    // handle if empty
    if (isEmpty(dataset)) {
      throw new Error('no dataset found');
    }

    // copy the original dataset
    this.dataset = dataset;

    const [element] = this.dataset;

    /**
     * check whether the transferred data to the required type Array<number[]>
     * if not, transform into a two-dimensional array.
     */
    if (!isArray(element)) {
      // get keys (factor names)
      this.names = this.getFactorNames(element);

      // if it's object, transform to the two-dimensional array
      this.dataset = this.transformTo2DArray(dataset);
    }

    /**
     * step 1
     * If some variables have a large variance and some small,
     * PCA (maximizing variance) will load on the large variances.
     */
    this.adjustedDataset = this.adjustDataset(this.dataset);

    /**
     * step 2
     * a covariance matrix (also known as dispersion matrix or variance–covariance matrix)
     * is a matrix whose element in the i, j position is the covariance
     * between the i-th and j-th elements of a random vector.
     */
    this.covariance = this.computeCovariance(this.adjustedDataset);

    /**
     * step 3-4
     * a linear transformation is a non-zero vector that changes
     * by only a scalar factor when that linear transformation is applied to it.
     */
    this.eigens = this.getEigens(this.covariance);

    /**
     * step 5
     * If one vector is equal to the sum of scalar multiples of other vectors,
     * it is said to be a linear combination of the other vectors.
     * read more: https://www.dsprelated.com/freebooks/mdft/Linear_Combination_Vectors.html
     */
    this.linearCombinations = this.getLinearCombinations(this.adjustedDataset, this.eigens.E.x);

    /**
     * step 6
     * analysis. How {PC1, PC2 ... PCn} accounts of the total variation around the PCs.
     */
    this.analysis = this.analyze(this.eigens.lambda.x);

    /**
     * step 7
     * additional calculations
     * get scatter points of the dataset for plotting the scatter
     */
    this.scatterPoints = this.getScatterPoints(this.adjustedDataset);
  }

  adjustDataset = (dataset: Array<number[]>): Array<number[]> => map(
    dataset,
    (data: Array<number>): Array<number> => {
      const mean: number = math.mean(data);
      const variance: number = math.var(data);
      const std: number = math.sqrt(variance);

      return map(data, (value: number): number => round((value - mean) / std, 3));
    },
  );

  computeCovariance = (dataset: Array<number[]>): Array<number[]> => cov(dataset);

  getEigens = (
    covariance: Array<number[]>,
  ): {
    // eigenvalues
    lambda: {
      x: Array<number[]>,
      y: Array<number[]>,
    },
    // eigenvectors
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

  getLinearCombinations = (
    dataset: Array<number[]>,
    eigenvectors: Array<number[]>,
  ): Array<number[]> => {
    const reducer: Array<number[]> = (acc: Array<number[]>, curr: Array<number[]>, i: number) => {
      // get column of eigenvectors matrix
      const vector: Array<number> = map(eigenvectors, (eigenvector: Array<number>): Array<number> => eigenvector[i]);

      // scalar multiplication of factor by vector
      const multiplication: Array<number[]> = map(dataset, (factors: Array<number>, j: number): Array<number> => {
        return map(factors, (factor: number): number => opposite(factor * vector[j]));
      });

      // get linear combinations (sum of scalar multiples of vectors)
      const linearCombination: Array<number> = map(math.transpose(multiplication), sum);

      // push to the accamulator
      if (!isUndefined(acc)) {
        acc.push(linearCombination);
      }

      return acc;
    };

    return reduce(eigenvectors, reducer, []);
  };

  analyze = (eigenvalues: Array<number>): Array<number> => {
    const summary: number = math.sum(eigenvalues);

    return map(eigenvalues, (lambda: number): number => round((lambda / summary) * 100, 2));
  };

  getScatterPoints = (
    dataset: Array<number[]>,
    axes: Array<string> = ['x', 'y'],
  ): Array<{ x: number, y: number, z?: number }> => {
    const reducer = (acc: Array<number>, curr: number, i: number) => {
      forEach(curr, (_, j: number) => {
        if (isUndefined(acc[j])) {
          acc[j] = {};
        }

        if (!isUndefined(axes[i])) {
          acc[j][axes[i]] = curr[j];
        }
      });

      return acc;
    };

    return reduce(dataset, reducer, []);
  };

  getFactorNames = (element: { x: any }): Array<string> => keys(element);

  transformTo2DArray = (data: Object): Array<number[]> => {
    const transformer = (acc: Array<number[]>, curr: Object) => {
      values(curr).forEach((value: number, i: number) => {
        (acc[i] || (acc[i] = [])).push(value);
      });
    };

    return transform(data, transformer, []);
  };
}

export default PCA;
