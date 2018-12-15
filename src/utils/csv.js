// @flow

// Comma-separated values (CSV) file is a delimited text file that uses a comma to separate values.
// A CSV file stores tabular data (numbers and text) in plain text.
// Each line of the file is a data record.
// Each record consists of one or more fields, separated by commas.
// The use of the comma as a field separator is the source of the name for this file format.

export default class CSV {
  static parse(csv: string): Array<{ value: number }> {
    const lines: Array<string> = csv.split('\n');
    const result: Array<{ value: number }> = [];
    const headers: Array<string> = lines[0].split(',');

    lines.map((line: string, indexLine: number) => {
      if (indexLine < 1) return; // Jump header line

      const obj: { value: number } = {};
      const currentline: Array<string> = line.split(',');

      headers.map((header: string, indexHeader: number) => {
        // convert to number
        if (typeof currentline[indexHeader] === 'string') {
          currentline[indexHeader] = parseFloat(currentline[indexHeader]);
        }

        // remove quotes from the object key
        obj[header.trim()] = currentline[indexHeader];

        return obj[header];
      });

      result.push(obj);
    });

    result.pop(); // remove the last item because undefined values

    return result;
  }
}
