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
import isNumber from "lodash/isNumber";
import map from "lodash/map";
import round from "lodash/round";
import slice from "lodash/slice";
import * as math from "mathjs";
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
  // enumerate table
  enumerate: boolean;
  // custom symbol if needed
  enumerateSymbol: string;
  // array of column names in the top of the table
  columns: string[];
  // collection of objects or two-dimensional array (matrix)
  rows: any[][];
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

  /**
   * Formatted rows for correct rendering rows.
   * Recomputes the memoized value when one of the inputs has changed.
   * This optimization helps to avoid
   * expensive calculations on every render.
   * @returns memoized value
   */
  const formattedRows: any[][] = React.useMemo(() => {
    let transposed = math.transpose(rows) as any[][];

    // if enumeration is enabled add indexes
    if (enumerate) {
      transposed = map(transposed, (row: any[], index: number) => [
        index + 1,
        ...row
      ]);
    }

    return transposed;
  }, [rows, enumerate]);

  /**
   * formatted rows divided by current page
   */
  const dividedRows = slice(
    formattedRows,
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  /**
   * empty rows for filling the space
   */
  const emptyRows: number =
    rowsPerPage -
    Math.min(rowsPerPage, formattedRows.length - page * rowsPerPage);

  /**
   * event handler for setting the new page
   * @param event any
   * @param newPage number of the new page
   */
  function handleChangePage(event: any, newPage: number) {
    setPage(newPage);
  }

  /**
   * event handler for changing the number
   * of displayed rows
   * @param event any
   */
  function handleChangeRowsPerPage(event: any) {
    setRowsPerPage(parseInt(event.target.value, 10));
  }

  /**
   * determines when to round a long numeric value.
   * @param value any value
   */
  function shouldRound(value: any): boolean {
    return isNumber(value) && String(value).replace(".", "").length > 3;
  }

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
              {map(columns, (column: string, i: number) => (
                <CustomTableCell key={i} align="right">
                  {column}
                </CustomTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {map(dividedRows, (row: any[], i: number) => (
              <TableRow key={i}>
                {map(row, (value: any, j: number) => {
                  // zero iteration (j === 0) is index number of current row
                  if (enumerate && j === 0) {
                    return (
                      <TableCell key={j} component="th" scope="row">
                        {value}
                      </TableCell>
                    );
                  }

                  return (
                    <TableCell key={j} align="right">
                      {shouldRound(value) ? round(value, 3) : value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
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
                count={formattedRows.length}
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
  // enable by default
  enumerate: true,
  // default symbol
  enumerateSymbol: "№",
  columns: [],
  rows: []
};
