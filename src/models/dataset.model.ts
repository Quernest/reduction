import isUndefined from "lodash/isUndefined";
import includes from "lodash/includes";
import isNull from "lodash/isNull";
import isString from "lodash/isString";
import forEach from "lodash/forEach";
import filter from "lodash/filter";
import { IParsedFile } from ".";

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

export class Dataset implements IDataset {
  public variables: string[] = [];
  public factors: string[] = [];
  public observations: string[] = [];
  public values: number[][] = [];
  public types?: string[];

  private minFactorsCount: number = 2;
  private minObservationsCount: number = 2;
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

  private handle() {
    const { columns, rows } = this.parsedFile;
    const { observationsIdx, typesIdx } = this.options;

    if (this.requiredVariablesCount + this.minFactorsCount > columns.length) {
      throw new Error(`
          the number of factors must be equal to or more than ${
            this.minFactorsCount
          }
          (taking into account the variable with observations and types if types are indicated)
        `);
    }

    forEach(columns, (column, i) => {
      if (isNull(column)) {
        throw new Error(`variable is required in the ${i + 1} cell.`);
      }
    });

    this.variables = columns;
    this.factors = filter(
      columns,
      (_, i) => !includes([observationsIdx, typesIdx], i)
    );

    forEach(rows, (row, i) => {
      if (this.requiredVariablesCount + this.minFactorsCount > row.length) {
        throw new Error(
          `the number of observations must be equal to or more than ${
            this.minObservationsCount
          }`
        );
      }

      forEach(row, (value, j) => {
        if (isNull(value)) {
          throw new Error(
            `value is required in the ${i + 1} row / ${j +
              this.requiredVariablesCount} cell.`
          );
        }

        if (i !== observationsIdx && i !== typesIdx && isString(value)) {
          throw new Error(
            `value in the ${i + 1} row / ${j +
              this.requiredVariablesCount} cell is string. It must be number.
                If it is observation names or types select this columns
                in selection menu.`
          );
        }
      });

      if (!isUndefined(typesIdx) && i === typesIdx && this.types) {
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
