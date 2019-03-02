export interface IEigenAnalysis {
  proportion: number[];
  totalProportion: number;
  importantComponentsVariance: number;
  amountOfImportantComponents: number;
  cumulative: number[];
  differences: number[];
}

export interface IEigens {
  E: {
    y: number[][];
    x: number[][];
  };
  lambda: {
    x: number[];
    y: number[];
  };
}

export interface IPCA {
  dataset: number[][];
  adjustedDataset: number[][];
  covariance: number[][];
  eigens: IEigens;
  linearCombinations: number[][];
  analysis: IEigenAnalysis;

  /**
   * get mean-adjusted data - PCA (maximizing variance)
   */
  adjustDataset(dataset: number[][]): number[][];

  /**
   * compute a covariance matrix from the adjusted dataset
   * @see https://en.wikipedia.org/wiki/Covariance_matrix
   */
  computeCovariance(adjustedDataset: number[][]): number[][];

  /**
   * get the eigenvectors and eigenvalues of the covariance matrix
   * @see https://en.wikipedia.org/wiki/Eigenvalues_and_eigenvectors
   */
  getEigens(covariance: number[][]): IEigens;

  /**
   * get linear combinations of eigenvectors
   * @see https://www.dsprelated.com/freebooks/mdft/Linear_Combination_Vectors.html
   */
  getLinearCombinations(
    adjustedDataset: number[][],
    eigenvectors: number[][]
  ): number[][];

  /**
   * analyze eigenvalues (compute PCs proportion in %)
   * describes how much {PC1, PC2 ... PCn} accounts of the total variation around the PCs.
   */
  analyze(eigenvalues: number[]): IEigenAnalysis;
}

export interface IPCACalculations {
  dataset: number[][];
  adjustedDataset: number[][];
  covariance: number[][];
  eigens: IEigens;
  linearCombinations: number[][];
  analysis: IEigenAnalysis;
}
