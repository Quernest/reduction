import Paper from "@material-ui/core/Paper";
import { Theme } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableFooter from "@material-ui/core/TableFooter";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import { makeStyles } from "@material-ui/styles";
import head from "lodash/head";
import isArray from "lodash/isArray";
import isNumber from "lodash/isNumber";
import keys from "lodash/keys";
import map from "lodash/map";
import round from "lodash/round";
import slice from "lodash/slice";
import * as React from "react";
import { CustomTableCell, TablePaginationActions } from "./";

const useStyles = makeStyles(({ spacing }: Theme) => ({
  root: {
    width: "100%",
    marginTop: spacing.unit * 2
  },
  table: {
    minWidth: 500
  },
  tableWrapper: {
    overflowX: "auto"
  },
  tablePagination: {
    display: "flex",
    justifyContent: "flex-start"
  }
}));

interface IProps {
  enumerate: boolean;
  enumerateSymbol: string;
  columns: string[];
  // collection of objects or two-dimensional array (matrix)
  rows: object[] | any[][];
}

export const OutputTable = ({
  enumerate,
  enumerateSymbol,
  columns,
  rows
}: IProps): JSX.Element => {
  const classes = useStyles();
  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(5);

  const emptyRows: number =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  function handleChangePage(event: any, newPage: number) {
    setPage(newPage);
  }

  function handleChangeRowsPerPage(event: any) {
    setRowsPerPage(parseInt(event.target.value, 10));
  }

  // todo: add normal counting
  function renderColumns(): JSX.Element[] {
    return map(columns, (col: string, i: number) => (
      <CustomTableCell key={i} align="right">
        {col}
      </CustomTableCell>
    ));
  }

  function renderCollection(): JSX.Element[] {
    return map(
      slice(rows, page * rowsPerPage, page * rowsPerPage + rowsPerPage),
      (row: { [_: string]: any }, i: number) => (
        <TableRow key={i}>
          {enumerate && (
            <TableCell component="th" scope="row">
              {i + 1}
            </TableCell>
          )}
          {map(keys(row), (key, index) => {
            // skip index key
            if (key !== "index") {
              return (
                <TableCell key={index} align="right">
                  {(() => {
                    // round long numbers (todo: decomposite)
                    if (
                      isNumber(row[key]) &&
                      String(row[key]).replace(".", "").length > 3
                    ) {
                      return round(row[key], 3);
                    }

                    return row[key];
                  })()}
                </TableCell>
              );
            }

            return null;
          })}
        </TableRow>
      )
    );
  }

  function renderMatrix(): JSX.Element[] | null {
    return null;
  }

  const isMatrix: boolean = isArray(instance);

  const instance = head<object | any[] | undefined>(rows);

  return (
    <Paper className={classes.root}>
      <div className={classes.tableWrapper}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              {enumerate && (
                <CustomTableCell align="left">
                  {enumerateSymbol}
                </CustomTableCell>
              )}
              {renderColumns()}
            </TableRow>
          </TableHead>
          <TableBody>
            {isMatrix ? renderMatrix() : renderCollection()}
            {emptyRows > 0 && (
              <TableRow style={{ height: 48 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                colSpan={1}
                count={rows.length}
                className={classes.tablePagination}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  native: true
                }}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </Paper>
  );
};

OutputTable.defaultProps = {
  enumerate: true,
  enumerateSymbol: "№",
  columns: [],
  rows: []
};
