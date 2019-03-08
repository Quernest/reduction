export interface ISOMOptions {
  maxStep: number;
  minLearningCoef: number;
  maxLearningCoef: number;
  minNeighborhood: number;
  maxNeighborhood: number;
}

export interface ISOMData {
  variables: string[];
  observations: string[];
  values: number[][];
  types?: string[];
}
