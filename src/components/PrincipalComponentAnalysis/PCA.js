/**
 * @flow
 * Math.js is an extensive math library for JavaScript and Node.js.
 */
import * as math from 'mathjs';

// utility library delivering modularity, performance & extras.
import assign from 'lodash/assign';
import head from 'lodash/head';
import sum from 'lodash/sum';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import keys from 'lodash/keys';
import round from 'lodash/round';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

// lib computes the covariance between one or more numeric arrays.
import cov from 'compute-covariance';

// library for formatting and manipulating numbers.
import numeric from 'numeric';

// helpers
import { opposite } from '../../utils/numbers';
import {
  transformArrayOfObjectsTo2DArray,
  transform2DArrayToArrayOfObjects,
} from '../../utils/transformations';

// types
type DatasetInstance = { [string]: number } | Array<number>;

type Dataset = Array<DatasetInstance>;

type AdjustedDataset = Array<number[]>;

type Covariance = Array<number[]>;

type LinearCombinations = Array<number[]>;

type Analysis = Array<number>;

type Eigens = {
  // vectors
  lambda: {
    x: Array<number[]>,
    y: Array<number[]>,
  },
  // values
  E: {
    x: Array<number>,
    y: Array<number>,
  },
};

try {
  math.import(numeric, { wrap: true, silent: true });
} catch (error) {
  throw new Error(
    'To use numeric.js, the library must be installed first via "npm install numeric"',
  );
}

/**
 * Creates new PCA (Principal Component Analysis) from the dataset
 * @see https://en.wikipedia.org/wiki/Principal_component_analysis
 */
class PCA {
  constructor(dataset: Dataset) {
    // handle if the dataset is empty
    if (isEmpty(dataset)) {
      throw new Error('no dataset found');
    }

    // copy the original dataset
    this.dataset = dataset;

    const instance: DatasetInstance = head(this.dataset);

    /**
     * check whether the transferred data to the required type Array<number[]>
     * if not, transform into a two-dimensional array.
     */
    if (!isArray(instance)) {
      // get keys (factor names)
      this.names = keys(instance);

      // if it's object, transform to the two-dimensional array
      this.dataset = transformArrayOfObjectsTo2DArray(dataset);
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
     * @see https://www.dsprelated.com/freebooks/mdft/Linear_Combination_Vectors.html
     */
    this.linearCombinations = this.getLinearCombinations(
      this.adjustedDataset,
      this.eigens.E.x,
    );

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
    this.points = transform2DArrayToArrayOfObjects(this.adjustedDataset);
  }

  adjustDataset = (dataset: Dataset): AdjustedDataset => map(
    dataset,
    (instance: Array<number>): Array<number> => {
      const mean: number = math.mean(instance);
      const variance: number = math.var(instance);
      const std: number = math.sqrt(variance);

      return map(
        instance,
        (value: number): number => round((value - mean) / std, 3),
      );
    },
  );

  computeCovariance = (dataset: Dataset | AdjustedDataset): Covariance => cov(dataset);

  getEigens = (covariance: Covariance): Eigens => {
    const matrix: Object = math.matrix(covariance);
    const eigens: Eigens = math.eval(`eig(${matrix})`);

    return assign(eigens, {
      E: {
        // invert eigenvectors because they have wrong direction
        x: opposite(eigens.E.x),
        y: opposite(eigens.E.y),
      },
    });
  };

  getLinearCombinations = (
    dataset: Dataset,
    eigenvectors: Array<number[]>,
  ): LinearCombinations => {
    const reducer: Array<number[]> = (
      accumulator: Array<number[]>,
      _,
      index: number,
    ) => {
      // get column of eigenvectors matrix
      const vector: Array<number> = map(
        eigenvectors,
        (eigenvector: Array<number>): Array<number> => eigenvector[index],
      );

      // scalar multiplication of factor by vector
      const scalarMultiplication: Array<number[]> = map(
        dataset,
        (factors: Array<number>, factorIndex: number): Array<number> => map(
          factors,
          (factor: number): number => factor * vector[factorIndex],
        ),
      );

      // get linear combinations (sum of scalar multiples of vectors)
      const linearCombination: Array<number> = map(
        math.transpose(scalarMultiplication),
        sum,
      );

      // push to the accamulator
      if (!isUndefined(accumulator)) {
        accumulator.push(linearCombination);
      }

      return accumulator;
    };

    return reduce(eigenvectors, reducer, []);
  };

  analyze = (eigenvalues: Array<number>): Analysis => {
    const summary: number = math.sum(eigenvalues);

    return map(
      eigenvalues,
      (lambda: number): number => round((lambda / summary) * 100, 2),
    );
  };
}

export default PCA;
