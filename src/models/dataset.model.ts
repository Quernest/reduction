export interface IDataset {
  variables: string[];
  factors: string[];
  observations: string[];
  values: number[][];
  types?: string[];
}

export interface IDatasetRequiredColumnsIndexes {
  observationsIdx: number;
  typesIdx?: number;
}
