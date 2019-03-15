import forEach from "lodash/forEach";
import head from "lodash/head";
import isNull from "lodash/isNull";
import isString from "lodash/isString";
import isUndefined from "lodash/isUndefined";
import map from "lodash/map";
import tail from "lodash/tail";
import Papa from "papaparse";
import { IParsedCSV } from "src/models";
import { getColumn } from "src/utils";

const ctx: Worker = self as any;

ctx.addEventListener("message", (event: MessageEvent) => {
  Papa.parse(event.data, {
    dynamicTyping: true,
    skipEmptyLines: true,
    encoding: "windows-1251",
    complete: ({ data }) => {
      const parsedFile: IParsedCSV = {
        variables: [],
        tailedVariables: [],
        observations: [],
        values: []
      };

      try {
        /**
         * data validations
         */
        const instance = head<any[]>(data);

        if (instance && instance.length < 3) {
          throw new Error(
            "the dataset must contain observations column and more than 2 variables"
          );
        }

        forEach(data, (row: Array<string | number>, rowIndex) => {
          forEach(row, (cell, cellIndex) => {
            /**
             * if one of values is null
             */
            if (isNull(cell)) {
              throw new Error(
                `the dataset has "null" value in (${++rowIndex} row, ${cellIndex} cell) position.`
              );
            }

            /**
             * if one of values is undefined
             */
            if (isUndefined(cell)) {
              throw new Error(
                `the dataset has "undefined" value in (${++rowIndex} row, ${cellIndex} cell) position.`
              );
            }

            /**
             * check numberic values
             */
            if (rowIndex > 0 && cellIndex > 0 && isString(cell)) {
              throw new Error(
                `the dataset has "string" value in (${++rowIndex} row, ${++cellIndex} cell). It must be a number.`
              );
            }

            /**
             * check observation names
             */
            if (cellIndex === 0 && !isString(cell)) {
              throw new Error(
                `no observation names or they are wrong.
                Make sure that all names and meanings of observations are completed.
                The names of the observers must be only strings.
                `
              );
            }
          });
        });

        /**
         * dataset without headers (variables)
         */
        const tailedData = tail<any[]>(data);

        /**
         * only observations column (zero column in dataset)
         */
        const observations = getColumn<string>(tailedData, 0);

        if (!observations || observations.length === 0) {
          throw new Error(`observations are empty`);
        } else {
          parsedFile.observations = observations;
        }

        /**
         *  only variables (headers) row
         */
        const variables = head<string[]>(data);

        /**
         * only variables (headers) without observations column
         */
        let tailedVariables: string[] = [];

        if (!variables || variables.length === 0) {
          throw new Error("variables are empty");
        } else {
          tailedVariables = tail(variables);
          parsedFile.variables = variables;
          parsedFile.tailedVariables = tailedVariables;
        }

        /**
         * dataset values
         */
        const values = map(tailedData, d => tail<number>(d));

        if (!values || values.length === 0) {
          throw new Error(`the dataset values are empty`);
        } else {
          parsedFile.values = values;
        }

        ctx.postMessage({ parsedFile });
      } catch (error) {
        ctx.postMessage({ error: error.message });
      }
    },
    error: error => ctx.postMessage({ error: error.message })
  });
});
