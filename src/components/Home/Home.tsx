import * as React from "react";
import { Link, LinkProps } from "react-router-dom";
import {
  withStyles,
  createStyles,
  Theme,
  StyleRules
} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

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
        <Button
          component={props => <Link {...props as LinkProps} to="/pca" />}
          variant="contained"
        >
          Principal Component Analysis
        </Button>
      </Grid>
    </Grid>
  </div>
));
