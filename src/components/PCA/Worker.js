// @flow
// @args: You can pass your worker parameters on initialisation
export default function MyWorker(args) {
  // eslint-disable-line no-unused-vars
  const onmessage = (event) => {
    const { data } = event;

    const parseCSV = (csv: string): Array<{ value: number }> => {
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
    };

    const readCSVFromFile = (file: File): void => {
      const reader: FileReader = new FileReader();

      reader.readAsText(file);

      reader.onload = (): void => {
        const parsedCSV: Array<{ value: number }> = parseCSV(reader.result);

        postMessage(parsedCSV);
      };

      reader.onerror = (error: Error): void => postMessage(error);
    };

    readCSVFromFile(data);
  };
}
