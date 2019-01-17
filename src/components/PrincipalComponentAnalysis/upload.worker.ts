import forEach = require("lodash/forEach");
import some = require("lodash/some");
import size = require("lodash/size");
import isEmpty = require("lodash/isEmpty");
import isNaN = require("lodash/isNaN");
import isString = require("lodash/isString");
import parseCSV, { IObject } from "../../utils/csv";

const ctx: Worker = self as any;

ctx.addEventListener("message", ev => {
  const { data } = ev;

  const fr = new FileReader();

  fr.readAsText(data);

  fr.onload = () => {
    const { result } = fr;

    let csv: IObject[];

    if (isString(result)) {
      csv = parseCSV(result);
    } else {
      throw new Error("data reading error");
    }

    console.log("csv file:", csv); // eslint-disable-line

    // is not permitted:
    // empty csv files
    if (isEmpty(csv)) {
      throw new Error("parsed csv is empty");
    }

    forEach(csv, obj => {
      // objects that contains less than 2 factors
      if (size(obj) < 2) {
        throw new Error(
          "the object of dataset must contain more than 2 factors."
        );
      }

      // String and NaN values
      const hasIncorrectValue = (value: any) => isNaN(value) || isString(value);

      if (some(obj, hasIncorrectValue)) {
        throw new Error("the dataset has some wrong values");
      }
    });

    ctx.postMessage(csv);
  };

  fr.onerror = error => ctx.postMessage(error);
});

// Expose the right type when imported via worker-loader.
// export default {} as typeof Worker & { new (): Worker };
