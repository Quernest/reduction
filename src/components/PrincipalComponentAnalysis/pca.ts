import cov from "compute-covariance";
import isUndefined from "lodash/isUndefined";
import map from "lodash/map";
import reduce from "lodash/reduce";
import round from "lodash/round";
import sum from "lodash/sum";
import * as math from "mathjs";
import numeric from "numeric";
import { IEigenAnalysis, IEigens, IPCA } from "src/models";

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
  public readonly dataset: number[][];
  public readonly adjustedDataset: number[][];
  public readonly covariance: number[][];
  public readonly eigens: IEigens;
  public readonly linearCombinations: number[][];
  public readonly analysis: IEigenAnalysis;

  public constructor(dataset: number[][]) {
    // copy the dataset
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

      return map(instance, (value: number): number => (value - mean) / std);
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

      // push to the accumulator
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
  public analyze(eigenvalues: number[]): IEigenAnalysis {
    const summary: number = math.sum(eigenvalues);

    /**
     * components (component names, PC1, PC2... PCn)
     */
    const components = map(eigenvalues, (_, i) => `PC${++i}`);

    /**
     * components with eigenvalues higher than 1
     */
    const importantComponents: string[] = [];

    /**
     * percentage of their variance
     */
    let importantComponentsVariance = 0;

    /**
     * Proportion of variance explained
     */
    const proportion: number[] = map(
      eigenvalues,
      (eigenvalue, i): number => {
        const percentage = round((eigenvalue / summary) * 100, 1);

        /**
         * eigenvalues less than 1.00 are not considered to be stable.
         * They account for less variability than does a single variable
         * and are not retained in the analysis.
         */
        if (eigenvalue >= 1) {
          importantComponents.push(components[i]);
          importantComponentsVariance += percentage;
        }

        return percentage;
      }
    );

    /**
     * total proportion of variance explained
     */
    const totalProportion: number = round(math.sum(proportion), 1);

    /**
     * Cumulative proportion of variance explained
     */
    const cumulative: number[] = reduce(
      proportion,
      (accumulator: number[], currentValue: number, i: number) => {
        if (i < 1) {
          accumulator[i] = currentValue;
        } else {
          accumulator[i] = round(accumulator[i - 1] + currentValue, 2);
        }

        return accumulator;
      },
      []
    );

    /**
     * difference b/n eigenvalues
     */
    const differences: number[] = reduce(
      eigenvalues,
      (accumulator: number[], current: number, i: number, list: number[]) => {
        const next: number = list[i + 1];

        if (next) {
          accumulator[i] = round(current - next, 2);
        } else {
          accumulator[i] = 0;
        }

        return accumulator;
      },
      []
    );

    return {
      proportion,
      totalProportion,
      importantComponents,
      importantComponentsVariance,
      components,
      cumulative,
      differences
    };
  }
}
