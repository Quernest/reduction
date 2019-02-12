import forEach from "lodash/forEach";
import isNaN from "lodash/isNaN";
import isString from "lodash/isString";
import { IParsedCSV, parseCSV } from "../../utils/csv";

const ctx: Worker = self as any;

ctx.addEventListener("message", (event: MessageEvent) => {
  const fr = new FileReader();

  fr.readAsText(event.data);

  fr.onload = () => {
    let parsedFile: IParsedCSV = {
      variables: [],
      tailedVariables: [],
      observations: [],
      values: []
    };

    try {
      if (isString(fr.result)) {
        parsedFile = parseCSV(fr.result);
      } else {
        throw new Error("data reading error");
      }

      const { variables, values, observations } = parsedFile;

      if (observations.length === 0) {
        throw new Error(
          `no observation names.
          Make sure that all names and meanings of observations are completed.
          The names of the observers must be only strings.
          `
        );
      }

      if (variables.length < 2) {
        throw new Error("the dataset must contain more than 2 variables");
      }

      forEach(values, value => {
        forEach(value, x => {
          if (isNaN(x)) {
            throw new Error("the dataset has some wrong values");
          }
        });
      });

      ctx.postMessage({ parsedFile });
    } catch (error) {
      ctx.postMessage({ error: error.message });
    }
  };

  fr.onerror = error => ctx.postMessage(error);
});
