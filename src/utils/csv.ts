import isString from 'lodash/isString';

type ParsedCSV = {
  [key: string]: any;
};

export default function parseCSV(csv: string): ParsedCSV[] {
  const lines: string[] = csv.split('\n');
  const result: ParsedCSV[] = [];
  const headers: string[] = lines[0].split(',');

  lines.map((line: string, indexLine: number) => {
    if (indexLine < 1) return; // Jump header line

    const obj = {};
    const currentline = line.split(',');

    headers.map((header: string, indexHeader: number) => {
      // convert to the number
      if (isString(currentline[indexHeader])) {
        currentline[indexHeader] = parseFloat(currentline[indexHeader]);
      }

      // remove double quotes from the object key
      obj[header.trim()] = currentline[indexHeader];

      return obj[header];
    });

    result.push(obj);
  });

  result.pop(); // remove the last item because undefined values

  return result;
}
