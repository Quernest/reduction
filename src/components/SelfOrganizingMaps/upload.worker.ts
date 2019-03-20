import head from "lodash/head";
import isEmpty from "lodash/isEmpty";
import tail from "lodash/tail";
import unzip from "lodash/unzip";
import Papa from "papaparse";

const ctx: Worker = self as any;

ctx.addEventListener("message", (event: MessageEvent) => {
  Papa.parse(event.data, {
    dynamicTyping: true,
    skipEmptyLines: true,
    encoding: "windows-1251",
    complete: ({ data }) => {
      try {
        if (isEmpty(data)) {
          throw new Error("the dataset is empty");
        }

        const columns = head<any[]>(data);

        if (!columns || columns.length === 0) {
          throw new Error("column names are empty");
        }

        const rows = unzip<any>(tail(data));

        if (!rows || rows.length === 0) {
          throw new Error("rows are empty");
        }

        ctx.postMessage({ filePreview: { columns, rows } });
      } catch (error) {
        ctx.postMessage({ error: error.message });
      }
    },
    error: error => ctx.postMessage({ error: error.message })
  });
});
