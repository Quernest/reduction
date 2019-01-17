// Math.js is an extensive math library for JavaScript and Node.js.
import * as math from "mathjs";

// lib computes the covariance between one or more numeric arrays.
import cov = require("compute-covariance");

// library for formatting and manipulating numbers.
import numeric = require("numeric");

// utility library delivering modularity, performance & extras.
import assign = require("lodash/assign");
import head = require("lodash/head");
import sum = require("lodash/sum");
import map = require("lodash/map");
import reduce = require("lodash/reduce");
import keys = require("lodash/keys");
import round = require("lodash/round");
import isArray = require("lodash/isArray");
import isEmpty = require("lodash/isEmpty");
import isUndefined = require("lodash/isUndefined");

// helpers
import { opposite } from "../../utils/numbers";
import { to2D, from2D } from "../../utils/transformations";

try {
  math.import(numeric, { wrap: true, silent: true });
} catch (error) {
  throw new Error("there is no numeric.js library");
}

/**
 * Creates new PCA (Principal Component Analysis) from the dataset
 * @see https://en.wikipedia.org/wiki/Principal_component_analysis
 */
class PCA {
  public names: string[];

  public dataset: number[][];

  public adjustedDataset: number[][];

  public covariance: number[][];

  public eigens: {
    E: {
      y: number[][];
      x: number[][];
    };
    lambda: {
      x: number[];
      y: number[];
    };
  };

  public linearCombinations: number[][];

  public analysis: number[];

  public points: object[];

  constructor(dataset: object[] | number[][]) {
    // handle if the dataset is empty
    if (isEmpty(dataset)) {
      throw new Error("no dataset found");
    }

    // handle if the dataset type is't array
    if (!isArray(dataset)) {
      throw new Error("the dataset must be an array type");
    }

    const instance: object | number[] = head(this.dataset);

    /**
     * check whether the transferred data to the required type
     * if not, transform into a two-dimensional array.
     */
    if (typeof instance === "object" && !isArray(instance)) {
      // get keys (factor names)
      this.names = keys(instance);

      // if it's object, transform to the two-dimensional array
      this.dataset = to2D(dataset);
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
     * @see https://en.wikipedia.org/wiki/Covariance_matrix
     */
    this.covariance = this.computeCovariance(this.adjustedDataset);

    /**
     * step 3-4
     * get a linear transformation is a non-zero vector that changes
     * by only a scalar factor when that linear transformation is applied to it.
     * @see https://en.wikipedia.org/wiki/Eigenvalues_and_eigenvectors
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
      this.eigens.E.x
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
    this.points = from2D(this.adjustedDataset);
  }

  /**
   * get mean-adjusted data
   */
  public adjustDataset(dataset: number[][]): number[][] {
    return map(dataset, (instance: number[]) => {
      const mean: number = math.mean(instance);
      const variance: number = math.var(instance);
      const std: number = math.sqrt(variance);

      return map(
        instance,
        (value: number): number => round((value - mean) / std, 3)
      );
    });
  }

  /**
   * compute a covariance matrix from the adjusted dataset
   */
  public computeCovariance(adjustedDataset: number[][]): number[][] {
    return cov(adjustedDataset);
  }

  /**
   * get the eigenvectors and eigenvalues of the covariance matrix
   */
  public getEigens(
    covariance: number[][]
  ): {
    E: {
      y: number[][];
      x: number[][];
    };
    lambda: {
      x: number[];
      y: number[];
    };
  } {
    const matrix = math.matrix(covariance);
    const eigens = math.eval(`eig(${matrix.toString()})`);

    // opposite eigenvectors direction because they are wrong
    return assign(eigens, {
      E: {
        x: opposite(eigens.E.x),
        y: opposite(eigens.E.y)
      }
    });
  }

  /**
   * get linear combinations of eigenvectors
   */
  public getLinearCombinations(
    adjustedDataset: number[][],
    eigenvectors: number[][]
  ): number[][] {
    const reducer = (
      accumulator: number[][],
      current: number[],
      index: number
    ): number[][] => {
      // get column of eigenvectors matrix
      const vector: number[] = map(
        eigenvectors,
        (eigenvector: number[]) => eigenvector[index]
      );

      // scalar multiplication of factor by vector
      const multiplication: number[][] = map(
        adjustedDataset,
        (factors: number[], factorIndex: number) =>
          map(factors, (factor: number): number => factor * vector[factorIndex])
      );

      // get linear combinations (sum of scalar multiples of vectors)
      const linearCombination: number[] = map(
        math.transpose(multiplication),
        sum
      );

      // push to the accamulator
      if (!isUndefined(accumulator)) {
        accumulator.push(linearCombination);
      }

      return accumulator;
    };

    return reduce(eigenvectors, reducer, []);
  }

  /**
   * analyze eigenvalues (compute PCs proportion in %)
   */
  public analyze(eigenvalues: number[]): number[] {
    const summary: number = math.sum(eigenvalues);

    return map(
      eigenvalues,
      (lambda: number): number => round((lambda / summary) * 100, 2)
    );
  }
}

export default PCA;
