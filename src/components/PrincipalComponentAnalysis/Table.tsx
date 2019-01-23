import Paper from "@material-ui/core/Paper";
import {
  createStyles,
  StyleRules,
  Theme,
  withStyles
} from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableFooter from "@material-ui/core/TableFooter";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import head from "lodash/head";
import isArray from "lodash/isArray";
import isEmpty from "lodash/isEmpty";
import isObject from "lodash/isObject";
import keys from "lodash/keys";
import map from "lodash/map";
import round from "lodash/round";
import * as React from "react";
import { from2D } from "../../utils/transformations";
import { TablePaginationActionsWrapped } from "./TablePaginationActions";

const CustomTableCell = withStyles((theme: Theme) => ({
  head: {
    // backgroundColor: theme.palette.grey[700],
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white
  },
  body: {
    fontSize: 14
  }
}))(TableCell);

const styles = ({ spacing }: Theme): StyleRules =>
  createStyles({
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
  });

interface IProps {
  enumerate: boolean;
  enumerateSymbol: string;
  columns: string[];
  rows: object[] | any[][];
  classes?: any;
}

interface IState {
  columns: string[];
  rows: Array<{ index: number; [key: string]: any }>;
  page: number;
  rowsPerPage: number;
}

export const OutputTable = withStyles(styles)(
  class extends React.Component<IProps, IState> {
    public static readonly defaultProps = {
      enumerate: true,
      enumerateSymbol: "№",
      columns: [],
      rows: []
    };

    public static getDerivedStateFromProps(props: IProps, state: IState) {
      // compare passed props with the current state
      if (
        (props.columns && props.columns !== state.columns) ||
        (props.rows && props.rows !== state.rows)
      ) {
        let { rows, columns } = props;

        // get instance of row
        const instance = head<object | any[] | undefined>(props.rows);

        // if there are no columns and the instance type is object get columns from the object keys
        if (isEmpty(props.columns) && isObject(instance)) {
          columns = keys(instance);
        }

        // if the instance type is array -> call transform to the array of objects function
        if (isArray(instance)) {
          rows = from2D<object>(rows as any[][], columns);
        }

        // add indexes to rows
        rows = map(rows, (row: object, index: number) => ({
          index: index + 1,
          ...row
        }));

        return {
          columns,
          rows
        };
      }

      // return null if the state hasn't changed
      return null;
    }

    public readonly state = {
      columns: [],
      rows: [],
      rowsPerPage: 5,
      page: 0
    };

    public render() {
      const { classes, enumerate, enumerateSymbol } = this.props;
      const { columns, rows, rowsPerPage, page } = this.state;
      const emptyRows: number =
        rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

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
                  {columns.map((column, index) => (
                    <CustomTableCell key={index} align="right">
                      {column}
                    </CustomTableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row: { [key: string]: any }) => (
                    <TableRow key={row.index}>
                      {enumerate && (
                        <TableCell component="th" scope="row">
                          {row.index}
                        </TableCell>
                      )}
                      {map(keys(row), (key, index) => {
                        // skip index key
                        if (key !== "index") {
                          return (
                            <TableCell key={index} align="right">
                              {row[key].length > 3
                                ? row[key]
                                : round(row[key], 3)}
                            </TableCell>
                          );
                        }

                        return null;
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
                    count={rows.length}
                    className={classes.tablePagination}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    SelectProps={{
                      native: true
                    }}
                    onChangePage={this.handleChangePage}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActionsWrapped}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </Paper>
      );
    }

    private handleChangePage = (event: any, page: number): void => {
      this.setState({ page });
    };

    private handleChangeRowsPerPage = (event: any): void => {
      this.setState({
        rowsPerPage: parseInt(event.target.value, 10)
      });
    };
  }
);
