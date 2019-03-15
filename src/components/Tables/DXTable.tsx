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
import includes from "lodash/includes";
import isNumber from "lodash/isNumber";
import map from "lodash/map";
import round from "lodash/round";
import unzip from "lodash/unzip";
import zipObject from "lodash/zipObject";
import React, { useState } from "react";
import { isLongNumber } from "src/utils";
import { Cell, FilterComponentsButton, IntervalInput } from "./";

const useStyles = makeStyles(({ spacing, breakpoints }: Theme) => ({
  root: {
    flexGrow: 1
  },
  toolbarContent: {
    display: "flex",
    alignItems: "center",
    flexGrow: 1
  },
  title: {
    marginRight: "auto",
    [breakpoints.down("sm")]: {
      fontSize: 14
    },
    [breakpoints.down("md")]: {
      fontSize: 16
    }
  }
}));

interface IProps {
  rows: Row[];
  columns: Column[];
  title?: string;
  importantComponentsList?: string[];
  intervalFilter?: boolean;
}

export const DXTable = ({
  title,
  rows,
  columns,
  importantComponentsList,
  intervalFilter
}: IProps): JSX.Element => {
  const classes = useStyles();
  const [hiddenColumnNames, setHiddenColumnNames] = useState<string[]>([]);
  const [interval, setInterval] = useState<number>(0);

  function onFilterComponents() {
    if (importantComponentsList && importantComponentsList.length > 0) {
      const columnNames = map(columns, ({ name }) => name).filter(
        name => !includes(importantComponentsList, name)
      );

      if (hiddenColumnNames.length === 0) {
        setHiddenColumnNames(columnNames);
      } else {
        setHiddenColumnNames([]);
      }
    }
  }

  function onChangeInterval({
    target: { value }
  }: React.ChangeEvent<HTMLInputElement>) {
    setInterval(Number(value));
  }

  const CellComponent = (props: Table.DataCellProps) => (
    <Cell interval={interval} {...props} />
  );

  return (
    <div className={classes.root}>
      <Paper>
        <Grid rows={rows} columns={columns}>
          <PagingState defaultCurrentPage={0} defaultPageSize={5} />
          <IntegratedPaging />
          <Table {...intervalFilter && { cellComponent: CellComponent }} />
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
                    {title && (
                      <Typography className={classes.title} variant="h6">
                        {title}
                      </Typography>
                    )}
                    {intervalFilter && (
                      <IntervalInput
                        onChange={onChangeInterval}
                        interval={interval}
                      />
                    )}
                    {importantComponentsList && (
                      <FilterComponentsButton onToggle={onFilterComponents} />
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
