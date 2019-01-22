import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import {
  createStyles,
  StyleRules,
  Theme,
  withStyles,
  WithStyles
} from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import * as React from "react";
import { Link, LinkProps } from "react-router-dom";

const styles = ({ breakpoints }: Theme): StyleRules =>
  createStyles({
    root: {
      flexGrow: 1
    },
    grow: {
      flexGrow: 1
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

export const Header = withStyles(styles)(({ classes }: IProps) => (
  <header className={classes.root}>
    <AppBar position="static">
      <Toolbar>
        <Grid container={true} justify="center">
          <Grid container={true} alignItems="center" className={classes.grid}>
            <Typography variant="h6" color="inherit" className={classes.grow}>
              Reduction
            </Typography>
            <Button
              variant="text"
              color="inherit"
              component={props => <Link to="/" {...props as LinkProps} />}
            >
              Home
            </Button>
            <Button
              variant="text"
              color="inherit"
              component={props => <Link to="/pca" {...props as LinkProps} />}
            >
              PCA
            </Button>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  </header>
));
