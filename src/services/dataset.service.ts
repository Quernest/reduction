import isUndefined from "lodash/isUndefined";
import includes from "lodash/includes";
import isNull from "lodash/isNull";
import isString from "lodash/isString";
import forEach from "lodash/forEach";
import filter from "lodash/filter";
import {
  IDataset,
  IFilePreview,
  IDatasetRequiredColumnsIndexes,
  IDatasetOptions
} from "../models";

export class DatasetService {
  private options: IDatasetOptions = {
    minFactorsCount: 2,
    minObservationsCount: 2,
    requiredVariablesCount: 1
  };

  private filePreview: IFilePreview = {
    columns: [],
    rows: []
  };

  private datasetRequiredColumnsIdxs: IDatasetRequiredColumnsIndexes = {
    observationsIdx: 0,
    typesIdx: undefined
  };

  public constructor(
    filePreview: IFilePreview,
    datasetRequiredColumnsIdxs: IDatasetRequiredColumnsIndexes,
    options?: IDatasetOptions
  ) {
    this.filePreview = filePreview;
    this.datasetRequiredColumnsIdxs = datasetRequiredColumnsIdxs;
    this.options = { ...this.options, ...options };

    if (!isUndefined(datasetRequiredColumnsIdxs.typesIdx)) {
      this.options.requiredVariablesCount += 1;
    }
  }

  public generate(): IDataset {
    const { rows, columns } = this.filePreview;
    const {
      requiredVariablesCount,
      minFactorsCount,
      minObservationsCount
    } = this.options;
    const { observationsIdx, typesIdx } = this.datasetRequiredColumnsIdxs;

    const dataset: IDataset = {
      variables: [],
      factors: [],
      observations: [],
      values: [],
      types: []
    };

    if (requiredVariablesCount + minFactorsCount > columns.length) {
      throw new Error(`
          the number of factors must be equal to or more than ${minFactorsCount}
          (taking into account the variable with observations and types if types are indicated)
        `);
    }

    forEach(columns, (column, i) => {
      if (isNull(column)) {
        throw new Error(`variable is required in the ${i + 1} cell.`);
      }
    });

    dataset.variables = columns;

    // variables without reserved columns
    dataset.factors = filter(
      columns,
      (_, i) => !includes([observationsIdx, typesIdx], i)
    );

    forEach(rows, (row, i) => {
      if (requiredVariablesCount + minFactorsCount > row.length) {
        throw new Error(
          `the number of observations must be equal to or more than ${minObservationsCount}`
        );
      }

      forEach(row, (value, j) => {
        if (isNull(value)) {
          throw new Error(
            `value is required in the ${i + 1} row / ${j +
              requiredVariablesCount} cell.`
          );
        }

        if (i !== observationsIdx && i !== typesIdx && isString(value)) {
          throw new Error(
            `value in the ${i + 1} row / ${j +
              requiredVariablesCount} cell is string. It must be number.
                If it is observation names or types select this columns
                in selection menu.`
          );
        }
      });

      if (!isUndefined(typesIdx) && i === typesIdx && dataset.types) {
        dataset.types = row;
      }

      if (i === observationsIdx) {
        dataset.observations = row;
      }

      if (i !== observationsIdx && i !== typesIdx) {
        dataset.values.push(row);
      }
    });

    return dataset;
  }
}
