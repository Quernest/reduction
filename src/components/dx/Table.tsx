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
  Table as DXTable,
  TableColumnVisibility,
  TableHeaderRow,
  Toolbar
} from "@devexpress/dx-react-grid-material-ui";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import includes from "lodash/includes";
import isNumber from "lodash/isNumber";
import map from "lodash/map";
import round from "lodash/round";
import unzip from "lodash/unzip";
import zipObject from "lodash/zipObject";
import React from "react";
import { isLongNumber } from "../../utils";
import { Cell, FilterComponentsButton, IntervalInput } from ".";
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
  root: {
    flexGrow: 1
  },
  toolbarContent: {
    display: "flex",
    alignItems: "center",
    flexGrow: 1
  },
  title: {
    marginRight: "auto"
  }
});

interface ITableProps {
  rows: Row[];
  columns: Column[];
  title?: string;
  importantComponentsList?: string[];
  intervalFilter?: boolean;
}

export const Table: React.FC<ITableProps> = ({
  title,
  rows,
  columns,
  importantComponentsList,
  intervalFilter
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [hiddenColumnNames, setHiddenColumnNames] = React.useState<string[]>(
    []
  );
  const [interval, setInterval] = React.useState<number>(0);
  const [isOpenIntervalInput, toggleIntervalInput] = React.useState<boolean>(
    false
  );

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

  function onOpenIntervalInput() {
    toggleIntervalInput(true);
  }

  function onCloseIntervalInput() {
    toggleIntervalInput(false);
  }

  const CellWrapper: React.FC<DXTable.DataCellProps> = props => (
    <Cell interval={interval} {...props} />
  );

  return (
    <div className={classes.root}>
      <Paper>
        <Grid rows={rows} columns={columns}>
          <PagingState defaultCurrentPage={0} defaultPageSize={5} />
          <IntegratedPaging />
          <DXTable
            {...intervalFilter &&
            interval &&
            isOpenIntervalInput && { cellComponent: CellWrapper }}
          />
          <TableHeaderRow />
          <TableColumnVisibility
            hiddenColumnNames={hiddenColumnNames}
            onHiddenColumnNamesChange={setHiddenColumnNames}
          />
          <Toolbar />
          <Plugin name="toolbar">
            <Template name="toolbarContent">
              <TemplateConnector>
                {({ }) => (
                  <div className={classes.toolbarContent}>
                    {title && (
                      <Typography className={classes.title} variant="body1">
                        {title}
                      </Typography>
                    )}
                    {intervalFilter && (
                      <IntervalInput
                        isOpen={isOpenIntervalInput}
                        onOpen={onOpenIntervalInput}
                        onClose={onCloseIntervalInput}
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
          <ColumnChooser
            messages={{
              showColumnChooser: t('DXTable.columnChooser.showColumnChooser')
            }}
          />
          <PagingPanel
            pageSizes={[5, 10, 15]}
            messages={{
              rowsPerPage: t('DXTable.paggingPanel.rowsPerPage'),
              info: t('DXTable.paggingPanel.info')
            }}
          />
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
