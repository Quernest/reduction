import { Plugin, Template, TemplateConnector } from "@devexpress/dx-react-core";
import {
  Column,
  IntegratedPaging,
  PagingState,
  Row
} from "@devexpress/dx-react-grid";
import {
  ColumnChooser,
  Grid,
  PagingPanel,
  Table,
  TableColumnVisibility,
  TableHeaderRow,
  Toolbar
} from "@devexpress/dx-react-grid-material-ui";
import { Theme } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import isNumber from "lodash/isNumber";
import map from "lodash/map";
import round from "lodash/round";
import unzip from "lodash/unzip";
import zipObject from "lodash/zipObject";
import React from "react";
import { isLongNumber } from "src/utils/numbers";

const useStyles = makeStyles(({ spacing }: Theme) => ({
  root: {
    flexGrow: 1
  },
  titleRoot: {
    marginRight: "auto"
  }
}));

interface IProps {
  title?: string;
  rows: Row[];
  columns: Column[];
}

export const DXTable = ({ title, rows, columns }: IProps): JSX.Element => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Paper>
        <Grid rows={rows} columns={columns}>
          <PagingState defaultCurrentPage={0} defaultPageSize={5} />
          <IntegratedPaging />
          <Table />
          <TableHeaderRow />
          <TableColumnVisibility defaultHiddenColumnNames={[]} />
          <Toolbar />
          {title && (
            <Plugin name="toolbarTitle">
              <Template name="toolbarContent">
                <TemplateConnector>
                  {({}) => (
                    <div className={classes.titleRoot}>
                      <Typography variant="h6">{title}</Typography>
                    </div>
                  )}
                </TemplateConnector>
              </Template>
            </Plugin>
          )}
          <ColumnChooser />
          <PagingPanel pageSizes={[5, 10, 15]} />
        </Grid>
      </Paper>
    </div>
  );
};

export const generateColumns = (columnNames: string[]) => {
  return map<string, Column>(columnNames, name => ({
    name,
    title: name,
    getCellValue: (row, columnName) =>
      isNumber(row[columnName]) && isLongNumber(row[columnName], 3)
        ? round(row[columnName], 3)
        : row[columnName]
  }));
};

export const generateRows = (rows: any[][], columnNames: string[]) => {
  return unzip<Row>(rows).map(row => zipObject(columnNames, row));
};
