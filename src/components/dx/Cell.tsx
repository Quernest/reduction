import { Table } from "@devexpress/dx-react-grid-material-ui";
import { makeStyles } from "@material-ui/styles";
import isNumber from "lodash/isNumber";
import React from "react";

const useStyles = makeStyles({
  highlightedCell: {
    backgroundColor: "#A2E2A4"
  },
  highlightedCellValue: {
    color: "#000"
  }
});

interface ITableDataCellProps extends Table.DataCellProps {
  interval: number;
}

const HighlightedCell: React.FC<ITableDataCellProps> = props => {
  const classes = useStyles();
  const { value, interval } = props;

  const inInterval =
    isNumber(value) && (value <= -interval || value >= interval);

  return (
    <Table.Cell
      {...props}
      className={inInterval ? classes.highlightedCell : undefined}
    >
      <span className={inInterval ? classes.highlightedCellValue : undefined}>
        {value}
      </span>
    </Table.Cell>
  );
};

export const Cell: React.FC<ITableDataCellProps> = props => {
  return <HighlightedCell {...props} />;
};
