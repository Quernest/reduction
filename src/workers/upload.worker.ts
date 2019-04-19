import { parse, ParseConfig } from "papaparse";
import tail from "lodash/tail";
import unzip from "lodash/unzip";
import head from "lodash/head";
import isEmpty from "lodash/isEmpty";

const ctx: Worker = self as any;

const config: ParseConfig = {
  dynamicTyping: true,
  skipEmptyLines: true,
  encoding: "windows-1251",
  complete: ({ data }) => {
    try {
      if (isEmpty(data)) {
        throw new Error("the dataset is empty");
      }

      const columns = head<any[]>(data);
      const rows = unzip<any>(tail(data));

      if (!columns || columns.length === 0 || !rows || rows.length === 0) {
        throw new Error("column names or rows are empty");
      }

      ctx.postMessage({ filePreview: { columns, rows } });
    } catch (error) {
      ctx.postMessage({ error: error.message });
    }
  },
  error: error => ctx.postMessage({ error: error.message })
};

ctx.addEventListener("message", (event: MessageEvent) =>
  parse(event.data, config)
);
