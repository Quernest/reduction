import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import { OutputTable } from "src/components/Tables";
import { IParsedCSV } from "src/utils/csv";

const useStyles = makeStyles(({ spacing }: Theme) => ({
  root: {
    flexGrow: 1
  },
  button: {
    marginBottom: spacing.unit * 2
  }
}));

interface IProps {
  parsedFile: IParsedCSV;
  onCalculate: () => void;
}

export const CalculateControls = ({ parsedFile, onCalculate }: IProps) => {
  const classes = useStyles();
  const { headers, data } = parsedFile;

  /**
   * memoized table for preventing unnecessary re-renders
   */
  const table = React.useMemo(
    () => <OutputTable rows={data} columns={headers} />,
    [data, headers]
  );

  if (headers && data) {
    return (
      <div className={classes.root}>
        <Grid item={true} xs={12}>
          <Typography variant="body1" paragraph={true}>
            The dataset is uploaded. Use calculate button for analysing.
          </Typography>
        </Grid>
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          onClick={onCalculate}
        >
          Calculate
        </Button>
        <Grid item={true} xs={12}>
          <Typography variant="button">dataset</Typography>
          {table}
        </Grid>
      </div>
    );
  }

  return null;
};
