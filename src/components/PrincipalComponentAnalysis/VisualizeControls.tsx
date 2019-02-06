import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import { SelectComponents } from "src/components";

const useStyles = makeStyles(({ spacing }: Theme) => ({
  root: {
    flexGrow: 1
  }
}));

interface IProps {
  analysis: number[];
  components: {
    x: number;
    y: number;
  };
  onChangeSelectComponents: (newComponents: { x: number; y: number }) => void;
  onVisualize: () => void;
}

export const VisualizeControls = ({
  analysis,
  components,
  onChangeSelectComponents,
  onVisualize
}: IProps) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Typography variant="body1" paragraph={true}>
        Calculations is ready. Press on the visualize button if you want
        represent the dataset.
      </Typography>
      <Grid container={true} alignItems="center">
        <SelectComponents
          analysis={analysis}
          onChange={onChangeSelectComponents}
          components={components}
        />
        <Button variant="contained" color="primary" onClick={onVisualize}>
          Visualize
        </Button>
      </Grid>
    </div>
  );
};
