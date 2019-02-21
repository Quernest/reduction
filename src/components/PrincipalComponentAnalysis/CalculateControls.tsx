import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import { OutputTable } from "src/components/Tables";
import { IParsedCSV } from "src/utils/csv";

const useStyles = makeStyles(({ spacing, palette }: Theme) => ({
  root: {
    flexGrow: 1
  },
  tableTitle: {
    marginBottom: spacing.unit
  },
  buttonWrapper: {
    position: "relative"
  },
  buttonProgress: {
    color: palette.primary.main,
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12
  }
}));

interface IProps {
  calculating?: boolean;
  parsedFile: IParsedCSV;
  onCalculate: () => void;
}

export const CalculateControls = ({
  calculating,
  parsedFile,
  onCalculate
}: IProps) => {
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
        <Grid container={true} alignItems="center" spacing={16}>
          <Grid item={true} xs={6} sm={4} md={3} lg={2}>
            <div className={classes.buttonWrapper}>
              <Button
                variant="contained"
                color="primary"
                disabled={calculating}
                onClick={onCalculate}
                fullWidth={true}
              >
                Calculate
              </Button>
              {calculating && (
                <CircularProgress
                  size={24}
                  className={classes.buttonProgress}
                />
              )}
            </div>
          </Grid>
          <Grid item={true} xs={12}>
            <Typography variant="button" className={classes.tableTitle}>
              dataset
            </Typography>
            {table}
          </Grid>
        </Grid>
      </div>
    );
  }

  return null;
};
