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
  const { variables, observations, values } = parsedFile;

  /**
   * memoized table for preventing unnecessary re-renders
   */
  const table = React.useMemo(
    () => <OutputTable rows={[observations, ...values]} columns={variables} />,
    [parsedFile]
  );

  if (variables && observations && values) {
    return (
      <div className={classes.root}>
        <Typography variant="body1" paragraph={true}>
          The dataset is processed. Press on the calculate button
        </Typography>
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
