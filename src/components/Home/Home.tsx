import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import {
  createStyles,
  StyleRules,
  Theme,
  withStyles
} from "@material-ui/core/styles";
import * as React from "react";
import { redirectTo } from "src/utils/redirectTo";

const styles = ({ spacing, breakpoints }: Theme): StyleRules =>
  createStyles({
    root: {
      flexGrow: 1,
      padding: spacing.unit * 2,
      [breakpoints.up("sm")]: {
        padding: spacing.unit * 3
      }
    },
    grid: {
      [breakpoints.up("md")]: {
        width: breakpoints.values.md
      }
    }
  });

interface IProps {
  classes?: any;
}

export const Home = withStyles(styles)(({ classes }: IProps) => (
  <div className={classes.root}>
    <Grid container={true} justify="center">
      <Grid className={classes.grid} container={true} alignItems="center">
        <Button {...redirectTo("/pca")} color="primary" variant="contained">
          Principal Component Analysis
        </Button>
      </Grid>
    </Grid>
  </div>
));
