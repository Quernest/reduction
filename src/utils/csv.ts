import forEach from "lodash/forEach";
import split from "lodash/split";
import tail from "lodash/tail";

export interface IParsedCSV {
  variables: string[];
  tailedVariables: string[];
  observations: string[];
  values: number[][];
}

export function parseCSV(csv: string): IParsedCSV {
  const lines = split(csv, "\n");

  /**
   * numberic values for PCA
   */
  const values: number[][] = [];

  /**
   * reserved first column of csv file
   * for storing names of observations
   */
  const observations: string[] = [];

  /**
   * considered variables (also, headers of columns)
   */
  const variables = split(lines[0], ",");

  /**
   * variables without a column with observations
   */
  const tailedVariables = tail(variables);

  forEach(tail(lines), (line, i) => {
    const currentLine = split(line, ",");
    const [observation] = currentLine;

    /**
     * observations = first column of csv file
     * only strings allowed in this column
     * if you remove this rule, the parser will consider
     * first column of observations for the column of names
     */
    if (observation && isNaN(parseFloat(observation))) {
      observations[i] = observation;
    }

    forEach(variables, (_, j) => {
      // skip observations
      if (currentLine[j] === observation) {
        return;
      }

      if (currentLine[j]) {
        // [j - 1] because first j-element is observation name
        (values[j - 1] || (values[j - 1] = [])).push(
          // convert cell to the number
          parseFloat(currentLine[j])
        );
      }
    });
  });

  return {
    variables,
    tailedVariables,
    observations,
    values
  };
}
