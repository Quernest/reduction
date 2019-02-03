import forEach from "lodash/forEach";
import isNaN from "lodash/isNaN";
import isString from "lodash/isString";
import { IParsedCSV, parseCSV } from "../../utils/csv";

const ctx: Worker = self as any;

ctx.addEventListener("message", (event: MessageEvent) => {
  const fr = new FileReader();

  fr.readAsText(event.data);

  fr.onload = () => {
    const { result } = fr;

    let parsedCSV: IParsedCSV;

    if (isString(result)) {
      parsedCSV = parseCSV(result);
    } else {
      throw new Error("data reading error");
    }

    const { headers, data } = parsedCSV;

    if (headers.length < 2) {
      throw new Error(
        "the object of dataset must contain more than 2 factors."
      );
    }

    const validate = (value: number) => {
      if (isNaN(value)) {
        throw new Error("the dataset has some wrong values");
      }
    };

    forEach(data, (element: number[]) => {
      forEach(element, (value: number) => validate(value));
    });

    ctx.postMessage(parsedCSV);
  };

  fr.onerror = error => ctx.postMessage(error);
});
