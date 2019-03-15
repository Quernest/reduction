import { Table } from "@devexpress/dx-react-grid-material-ui";
import { makeStyles } from "@material-ui/styles";
import React from "react";

const useStyles = makeStyles({
  highlightedCell: {
    backgroundColor: "#A2E2A4"
  },
  highlightedCellValue: {
    color: "#000"
  }
});

interface IProps extends Table.DataCellProps {
  interval: number;
}

const HighlightedCell = (props: IProps) => {
  const classes = useStyles();
  const { value, interval } = props;
  const inInterval = interval && (value <= -interval || value >= interval);

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

export const Cell = (props: IProps) => {
  return <HighlightedCell {...props} />;
};
