import forEach from "lodash/forEach";
import split from "lodash/split";

export interface IParsedCSV {
  headers: string[];
  data: number[][];
}

export const parseCSV = (csv: string): IParsedCSV => {
  const lines = split(csv, "\n");
  const data: number[][] = [];
  const headers = split(lines[0], ",");

  forEach(lines, (line: string, indexLine: number) => {
    if (indexLine < 1) {
      return;
    }

    const currentLine = split(line, ",");

    forEach(headers, (header: string, indexHeader: number) => {
      if (!data[indexHeader]) {
        data[indexHeader] = [];
      }

      if (currentLine[indexHeader]) {
        data[indexHeader].push(parseFloat(currentLine[indexHeader]));
      }
    });
  });

  return {
    headers,
    data
  };
};
