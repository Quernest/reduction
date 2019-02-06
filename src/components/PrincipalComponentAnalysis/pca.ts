// Math.js is an extensive math library for JavaScript and Node.js.
import * as math from "mathjs";

// lib computes the covariance between one or more numeric arrays.
import cov from "compute-covariance";

// library for formatting and manipulating numbers.
import numeric from "numeric";

// utility library delivering modularity, performance & extras.
// import assign from "lodash/assign";
import isArray from "lodash/isArray";
import isEmpty from "lodash/isEmpty";
import isUndefined from "lodash/isUndefined";
import map from "lodash/map";
import reduce from "lodash/reduce";
import round from "lodash/round";
import sum from "lodash/sum";

// models
import { IPCA } from "src/models/pca.model";

// helpers
// import { opposite } from "../../utils/numbers";
// import { from2D } from "../../utils/transformations";

try {
  math.import(numeric, { wrap: true, silent: true });
} catch (error) {
  throw new Error("there is no numeric.js library");
}

/**
 * Creates new PCA (Principal Component Analysis) from the dataset
 * @see https://en.wikipedia.org/wiki/Principal_component_analysis
 */
export class PCA implements IPCA {
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

  constructor(dataset: number[][], variables: string[]) {
    // handle if the dataset is empty
    if (isEmpty(dataset)) {
      throw new Error("no dataset found");
    }

    // handle if the dataset type is't array
    if (!isArray(dataset)) {
      throw new Error("the dataset must be an array type");
    }

    this.dataset = dataset;

    // step 1
    this.adjustedDataset = this.adjustDataset(this.dataset);

    // step 2
    this.covariance = this.computeCovariance(this.adjustedDataset);

    // step 3-4
    this.eigens = this.getEigens(this.covariance);

    // step 5
    this.linearCombinations = this.getLinearCombinations(
      this.adjustedDataset,
      this.eigens.E.x
    );

    // step 6
    this.analysis = this.analyze(this.eigens.lambda.x);
  }

  /**
   * get mean-adjusted data - PCA (maximizing variance)
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
   * @see https://en.wikipedia.org/wiki/Covariance_matrix
   */
  public computeCovariance(adjustedDataset: number[][]): number[][] {
    return cov(adjustedDataset);
  }

  /**
   * get the eigenvectors and eigenvalues of the covariance matrix
   * @see https://en.wikipedia.org/wiki/Eigenvalues_and_eigenvectors
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

    return eigens;

    // you can opposite eigenvectors direction if they are wrong
    // return assign(eigens, {
    //   E: {
    //     x: opposite(eigens.E.x),
    //     y: opposite(eigens.E.y)
    //   }
    // });
  }

  /**
   * get linear combinations of eigenvectors
   * @see https://www.dsprelated.com/freebooks/mdft/Linear_Combination_Vectors.html
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
   * describes how much {PC1, PC2 ... PCn} accounts of the total variation around the PCs.
   */
  public analyze(eigenvalues: number[]): number[] {
    const summary: number = math.sum(eigenvalues);

    return map(
      eigenvalues,
      (lambda: number): number => round((lambda / summary) * 100, 2)
    );
  }
}
