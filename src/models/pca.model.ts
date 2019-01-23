export interface IPCA {
  names: string[];
  dataset: number[][];
  adjustedDataset: number[][];
  covariance: number[][];
  eigens: {
    E: {
      y: number[][];
      x: number[][];
    };
    lambda: {
      x: number[];
      y: number[];
    };
  };
  linearCombinations: number[][];
  analysis: number[];
  points: Array<{ x: number; y: number }>;
  adjustDataset(dataset: number[][]): number[][];
  computeCovariance(adjustedDataset: number[][]): number[][];
  getEigens(
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
  };
  getLinearCombinations(
    adjustedDataset: number[][],
    eigenvectors: number[][]
  ): number[][];
  analyze(eigenvalues: number[]): number[];
}

export interface IPCACalculations {
  names: string[];
  dataset: number[][];
  adjustedDataset: number[][];
  covariance: number[][];
  eigens: {
    E: {
      y: number[][];
      x: number[][];
    };
    lambda: {
      x: number[];
      y: number[];
    };
  };
  linearCombinations: number[][];
  analysis: number[];
  points: Array<{ x: number; y: number }>;
}
