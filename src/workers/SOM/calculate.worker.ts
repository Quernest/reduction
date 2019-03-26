import { generateGrid, Kohonen } from "@seracio/kohonen";
import filter from "lodash/filter";
import forEach from "lodash/forEach";
import includes from "lodash/includes";
import isNull from "lodash/isNull";
import isString from "lodash/isString";
import isUndefined from "lodash/isUndefined";
import unzip from "lodash/unzip";
import {
  IDataset,
  IDatasetRequiredColumnsIndexes,
  IFilePreview,
  IHexagonalGridDimensions,
  ISOMOptions
} from "src/models";

const ctx: Worker = self as any;

interface IEventData {
  datasetRequiredColumnsIdxs: IDatasetRequiredColumnsIndexes;
  filePreview: IFilePreview;
  dimensions: IHexagonalGridDimensions;
  options: ISOMOptions;
}

ctx.addEventListener(
  "message",
  (event: MessageEvent) => {
    const {
      datasetRequiredColumnsIdxs: { observationsIdx, typesIdx },
      filePreview: { columns, rows },
      dimensions,
      options: {
        maxStep,
        minLearningCoef,
        maxLearningCoef,
        minNeighborhood,
        maxNeighborhood
      }
    }: IEventData = event.data;

    /**
     * minimum number of variables for values
     */
    const minFactorsCount = 2;

    /**
     * minimum number of observations
     */
    const minObservationsCount = 2;

    /**
     * the number of reserved columns (required)
     */
    let requiredVariablesCount = 1;

    /**
     * add one required column if types are specified
     */
    if (!isUndefined(typesIdx)) {
      requiredVariablesCount += 1;
    }

    /**
     * for correct calculations and display of information
     * it is necessary to pass validations
     */

    try {
      const dataset: IDataset = {
        variables: [],
        factors: [],
        observations: [],
        values: [],
        types: []
      };

      /**
       * if the number of variables is less than
       * two (considering reserved types and observations)
       */
      if (requiredVariablesCount + minFactorsCount > columns.length) {
        throw new Error(`
        the number of factors must be equal to or more than ${minFactorsCount}
        (taking into account the variable with observations and types if types are indicated)
      `);
      }

      /**
       * validation of variable names (factors)
       */
      forEach(columns, (column, i) => {
        /**
         * if the column name is empty, its value will be null
         */
        if (isNull(column)) {
          throw new Error(`variable is required in the ${i + 1} cell.`);
        }
      });

      /**
       * set columns as variables
       */
      dataset.variables = columns;

      /**
       * factors are variables without reserved columns,
       * i.e. variables describing numerical values
       */
      dataset.factors = filter(
        columns,
        (_, i) => !includes([observationsIdx, typesIdx], i)
      );

      /**
       * validation of rows and values
       */
      forEach(rows, (row, i) => {
        if (requiredVariablesCount + minFactorsCount > row.length) {
          throw new Error(
            `the number of observations must be equal to or more than ${minObservationsCount}`
          );
        }

        forEach(row, (value, j) => {
          /**
           * null values are not allowed
           */
          if (isNull(value)) {
            throw new Error(
              `value is required in the ${i + 1} row / ${j +
                requiredVariablesCount} cell.`
            );
          }

          /**
           * string values ​​besides variable with types and observations are not allowed
           */
          if (i !== observationsIdx && i !== typesIdx && isString(value)) {
            throw new Error(
              `value in the ${i + 1} row / ${j +
                requiredVariablesCount} cell is string. It must be number.
              If it is observation names or types select this columns
              in selection menu.`
            );
          }
        });

        /**
         * add types if used
         */
        if (!isUndefined(typesIdx) && i === typesIdx && dataset.types) {
          dataset.types = row;
        }

        /**
         * add observations
         */
        if (i === observationsIdx) {
          dataset.observations = row;
        }

        /**
         * add values
         */
        if (i !== observationsIdx && i !== typesIdx) {
          dataset.values.push(row);
        }
      });

      // run som
      const k = new Kohonen({
        neurons: generateGrid(dimensions.columns, dimensions.rows),
        data: unzip(dataset.values),
        maxStep,
        minLearningCoef,
        maxLearningCoef,
        minNeighborhood,
        maxNeighborhood
      });

      k.training();

      ctx.postMessage({
        dataset,
        positions: k.mapping(),
        umatrix: k.umatrix(),
        neurons: k.neurons,
        topographicError: k.topographicError(),
        quantizationError: k.quantizationError()
      });
    } catch (error) {
      ctx.postMessage({ error: error.message });
    }
  },
  false
);