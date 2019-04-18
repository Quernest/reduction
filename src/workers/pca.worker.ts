import filter from "lodash/filter";
import forEach from "lodash/forEach";
import includes from "lodash/includes";
import isNull from "lodash/isNull";
import isString from "lodash/isString";
import map from 'lodash/map';
import unzip from 'lodash/unzip';
import isUndefined from "lodash/isUndefined";
import {
  IDataset,
  IDatasetRequiredColumnsIndexes,
  IFilePreview,
} from "src/models";
// @ts-ignore
import PCA from 'ml-pca';
import Matrix from 'ml-matrix';
// import zip from 'lodash/zip';

const ctx: Worker = self as any;

ctx.addEventListener(
  "message",
  (event: MessageEvent) => {
    const {
      datasetRequiredColumnsIdxs: { observationsIdx, typesIdx },
      filePreview: { columns, rows }
    }: {
      datasetRequiredColumnsIdxs: IDatasetRequiredColumnsIndexes;
      filePreview: IFilePreview;
    } = event.data;

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

      const unzipped = unzip(dataset.values);
      const options = {
        scale: true,
        center: true,
      };
      const pca = new PCA(unzipped, options);
      const explainedVariance: number[] = pca.getExplainedVariance();
      const cumulativeVariance: number[] = pca.getCumulativeVariance();
      const adjustedDataset: Matrix = pca._adjust(unzipped, options);
      const loadings: Matrix = pca.getLoadings();
      const predictions: Matrix = pca.predict(unzipped);
      const eigenvalues: number[] = pca.getEigenvalues();

      /**
       * components (component names, PC1, PC2... PCn)
       */
      const components = map(eigenvalues, (_, i) => `PC${++i}`);

      /**
       * components with eigenvalues higher than 1
       */
      const importantComponents: string[] = [];

      forEach(eigenvalues, (eigenvalue, i) => {
        if (eigenvalue >= 1) {
          importantComponents[i] = components[i];
        }
      });

      ctx.postMessage({
        dataset,
        explainedVariance,
        cumulativeVariance,
        loadings: loadings.to2DArray(),
        predictions: unzip(predictions.to2DArray()),
        eigenvalues,
        components,
        importantComponents,
        adjustedDataset: unzip(adjustedDataset.to2DArray())
      })
    } catch (error) {
      ctx.postMessage({ error: error.message });
    }
  },
  false
);
