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
      headers: [],
      data: []
    };

    try {
      if (isString(fr.result)) {
        parsedFile = parseCSV(fr.result);
      } else {
        throw new Error("data reading error");
      }

      const { headers, data } = parsedFile;

      if (headers.length < 2) {
        throw new Error(
          "the object of dataset must contain more than 2 factors."
        );
      }

      forEach(data, (element: number[]) => {
        forEach(element, (value: number) => {
          if (isNaN(value)) {
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
