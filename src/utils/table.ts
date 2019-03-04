import isNumber from "lodash/isNumber";
import map from "lodash/map";
import round from "lodash/round";
import unzip from "lodash/unzip";
import {
  MUIDataTableColumnDef,
  MUIDataTableColumnOptions,
  MUIDataTableOptions
} from "mui-datatables";
import { isLongNumber } from "./numbers";

export const MUITableOptions: MUIDataTableOptions = {
  sort: false,
  search: true,
  sortFilterList: false,
  filter: false,
  selectableRows: false,
  responsive: "scroll"
};

export const generateColumns = (
  columns: string[],
  options?: MUIDataTableColumnOptions
) => {
  return map<string, MUIDataTableColumnDef>(columns, name => ({
    name,
    options: {
      ...options,
      customBodyRender: x => {
        // round long numbers
        if (isNumber(x) && isLongNumber(x, 3)) {
          return round(x, 3);
        }

        return x;
      }
    }
  }));
};

export const generateData = (rows: Array<Array<number | string>>) => {
  return unzip<string | number>(rows);
};
