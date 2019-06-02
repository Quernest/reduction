import isUndefined from "lodash/isUndefined";
import includes from "lodash/includes";
import isNull from "lodash/isNull";
import isString from "lodash/isString";
import forEach from "lodash/forEach";
import filter from "lodash/filter";
import { IParsedFile } from ".";

export interface IDataset {
  /**
   * variables (also columns) in dataset table
   */
  variables: string[];

  /**
   * variables without observations
   * @todo new variable name
   */
  factors: string[];

  /**
   * names of observations
   * it may be index or code
   */
  observations: string[];

  /**
   * only numeric values
   */
  values: number[][];

  /**
   * names of types
   * need for classification by type
   */
  types?: string[];
}

export interface IDatasetRequiredColumnsIndexes {
  observationsIdx: number;
  typesIdx?: number;
}

export class Dataset implements IDataset {
  public variables: string[] = [];
  public factors: string[] = [];
  public observations: string[] = [];
  public values: number[][] = [];
  public types?: string[];

  /**
   * required vars for factors
   */
  private minFactorsCount: number = 2;

  /**
   * required vars for observations
   */
  private minObservationsCount: number = 2;

  /**
   * getting required variables count
   */
  private get requiredVariablesCount(): number {
    return isUndefined(this.options.typesIdx) ? 1 : 2;
  }

  public constructor(
    private parsedFile: IParsedFile = {
      rows: [],
      columns: []
    },
    private options: IDatasetRequiredColumnsIndexes = {
      observationsIdx: 0,
      typesIdx: undefined
    }
  ) {
    this.handle();
  }

  /**
   * process for formating the dataset
   */
  private handle() {
    const { columns, rows } = this.parsedFile;
    const { observationsIdx, typesIdx } = this.options;

    if (this.requiredVariablesCount + this.minFactorsCount > columns.length) {
      throw new Error('pages.docs.importantInfoPart1');
    }

    forEach(columns, (column, i) => {
      if (isNull(column)) {
        throw new Error(`errors.isInvalidDatasetValue`);
      }
    });

    this.variables = columns;
    this.factors = filter(
      columns,
      (_, i) => !includes([observationsIdx, typesIdx], i)
    );

    forEach(rows, (row, i) => {
      if (this.minObservationsCount > row.length) {
        throw new Error('pages.docs.importantInfoPart2');
      }

      forEach(row, (value, j) => {
        if (isNull(value)) {
          throw new Error('errors.isInvalidDatasetValue');
        }

        if (i !== observationsIdx && i !== typesIdx && isString(value)) {
          throw new Error('errors.isInvalidDatasetValue');
        }
      });

      if (!isUndefined(typesIdx) && i === typesIdx) {
        this.types = row;
      }

      if (i === observationsIdx) {
        this.observations = row;
      }

      if (i !== observationsIdx && i !== typesIdx) {
        this.values.push(row);
      }
    });
  }
}
