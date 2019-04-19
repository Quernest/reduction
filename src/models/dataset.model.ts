export interface IDataset {
  variables: string[];
  factors: string[];
  observations: string[];
  values: number[][];
  types?: string[];
}

export interface IDatasetOptions {
  minFactorsCount: number;
  minObservationsCount: number;
  requiredVariablesCount: number;
}

export interface IDatasetRequiredColumnsIndexes {
  observationsIdx: number;
  typesIdx?: number;
}
