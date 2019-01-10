import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import head from 'lodash/head';
import map from 'lodash/map';
import keys from 'lodash/keys';
import round from 'lodash/round';
import isEmpty from 'lodash/isEmpty';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import { transform2DArrayToArrayOfObjects } from '../../utils/transformations';
import TablePaginationActions from './TablePaginationActions';

const CustomTableCell = withStyles(theme => ({
  head: {
    // backgroundColor: theme.palette.grey[700],
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

type Props = {
  enumerate: boolean,
  enumerateSymbol: string,
  columns: Array<string>,
  rows: Array<{ [string]: any }> | Array<any[]>,
  classes: Object,
};

type State = {
  columns: Array<string>,
  rows: Array<{ index: number, [string]: any }>,
  page: number,
  rowsPerPage: number,
};

class CustomPaginationActionsTable extends React.Component<Props, State> {
  static defaultProps = {
    enumerate: true,
    enumerateSymbol: '№',
    columns: [],
    rows: [],
  };

  static getDerivedStateFromProps(props, state) {
    // compare passed props with the current state
    if (
      (props.columns && props.columns !== state.columns)
      || (props.rows && props.rows !== state.rows)
    ) {
      let { rows, columns } = props;

      // get instance of row
      const instance: Array<any> | Object = head(props.rows);

      // if there are no columns and the instance type is object get columns from the object keys
      if (isEmpty(props.columns) && isObject(instance)) {
        columns = keys(instance);
      }

      // if the instance type is array -> call transform to the array of objects function
      if (isArray(instance)) {
        rows = transform2DArrayToArrayOfObjects(props.rows, columns);
      }

      // add indexes to rows
      rows = map(rows, (row, index) => ({
        index: index + 1,
        ...row,
      }));

      return {
        rows,
        columns,
      };
    }

    // return null if the state hasn't changed
    return null;
  }

  state = {
    columns: [],
    rows: [],
    page: 0,
    rowsPerPage: 5,
  };

  handleChangePage = (event, page: number): void => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = (event): void => {
    this.setState({
      rowsPerPage: parseInt(event.target.value, 10),
    });
  };

  render() {
    const { classes, enumerate, enumerateSymbol } = this.props;
    const {
      columns, rows, rowsPerPage, page,
    } = this.state;
    const emptyRows: number = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

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
                .map(row => (
                  <TableRow key={row.index}>
                    {enumerate && (
                      <TableCell component="th" scope="row">
                        {row.index}
                      </TableCell>
                    )}
                    {map(keys(row), (key, index) => {
                      // skip index key
                      if (key !== 'index') {
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
                    native: true,
                  }}
                  onChangePage={this.handleChangePage}
                  onChangeRowsPerPage={this.handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </Paper>
    );
  }
}

const styles = ({ spacing: { unit } }) => ({
  root: {
    width: '100%',
    marginTop: unit * 2,
  },
  table: {
    minWidth: 500,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  tablePagination: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
});

export default withStyles(styles)(CustomPaginationActionsTable);
