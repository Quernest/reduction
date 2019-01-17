import isString = require("lodash/isString");

export interface IObject {
  [key: string]: string | number;
}

export default function parseCSV(csv: string): IObject[] {
  const lines: string[] = csv.split("\n");
  const result: IObject[] = [];
  const headers: string[] = lines[0].split(",");

  lines.map((line: string, indexLine: number) => {
    if (indexLine < 1) return; // Jump header line

    const obj: IObject = {};
    const currentLine: string[] = line.split(",");

    headers.map((header: string, indexHeader: number) => {
      // remove double quotes from the object key and convert string to the number
      obj[header.trim()] = parseFloat(currentLine[indexHeader]);

      return obj[header];
    });

    result.push(obj);
  });

  result.pop(); // remove the last item because undefined values

  return result;
}
