// @flow

export type DatasetInstance = { [string]: number } | Array<number>;

export type Dataset = Array<DatasetInstance>;

export type AdjustedDataset = Array<number[]>;

export type Covariance = Array<number[]>;

export type LinearCombinations = Array<number[]>;

export type Analysis = Array<number>;

export type Eigens = {
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

export type Names = Array<string>;

// can be multiple indexes
export type Points = Array<{ [string]: number }>;

export interface PCAInterface {
  dataset: Dataset;
  names: Names;
  adjustedDataset: AdjustedDataset;
  covariance: Covariance;
  eigens: Eigens;
  linearCombinations: LinearCombinations;
  analysis: Analysis;
  points: Points;
  constructor(dataset: Dataset): void;
  adjustDataset(dataset: Dataset): AdjustedDataset;
  computeCovariance(dataset: Dataset | AdjustedDataset): Covariance;
  getEigens(covariance: Covariance): Eigens;
  getLinearCombinations(
    adjustedDataset: AdjustedDataset,
    eigenvectors: Array<number[]>,
  ): LinearCombinations;
  analyze(eigenvalues: Array<number>): Analysis;
}
