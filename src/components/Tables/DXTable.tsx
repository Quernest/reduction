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
import React, { useState } from "react";
import { isLongNumber } from "src/utils";
import { FilterButton } from "./";

const useStyles = makeStyles(({ spacing }: Theme) => ({
  root: {
    flexGrow: 1
  },
  toolbarContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexGrow: 1
  }
}));

interface IProps {
  title?: string;
  rows: Row[];
  columns: Column[];
  importantComponentsList?: string[];
}

export const DXTable = ({
  title,
  rows,
  columns,
  importantComponentsList
}: IProps): JSX.Element => {
  const classes = useStyles();
  const [hiddenColumnNames, setHiddenColumnNames] = useState<string[]>([]);

  function onFilterComponents() {
    if (importantComponentsList && importantComponentsList.length > 0) {
      const currentColumnNames = columns.map(({ name }) => name);
      const filteredCurrentColumnNames = currentColumnNames.filter(
        name => !importantComponentsList.includes(name)
      );

      setHiddenColumnNames(filteredCurrentColumnNames);
    }
  }

  return (
    <div className={classes.root}>
      <Paper>
        <Grid rows={rows} columns={columns}>
          <PagingState defaultCurrentPage={0} defaultPageSize={5} />
          <IntegratedPaging />
          <Table />
          <TableHeaderRow />
          <TableColumnVisibility
            hiddenColumnNames={hiddenColumnNames}
            onHiddenColumnNamesChange={setHiddenColumnNames}
          />
          <Toolbar />
          <Plugin name="toolbar">
            <Template name="toolbarContent">
              <TemplateConnector>
                {({}) => (
                  <div className={classes.toolbarContent}>
                    {title && <Typography variant="h6">{title}</Typography>}
                    {importantComponentsList && (
                      <FilterButton onToggle={onFilterComponents} />
                    )}
                  </div>
                )}
              </TemplateConnector>
            </Template>
          </Plugin>
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
