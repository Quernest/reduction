import * as React from "react";
import { Link, LinkProps } from "react-router-dom";
import { withStyles, createStyles, Theme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

export interface Props {
  classes?: any;
  children?: React.ReactNode;
}

const Header: React.StatelessComponent<{}> = ({ classes }: Props) => (
  <header className={classes.root}>
    <AppBar position="static">
      <Toolbar>
        <Grid container justify="center">
          <Grid container alignItems="center" className={classes.grid}>
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
);

const styles = ({ breakpoints }: Theme) =>
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

export default withStyles(styles)(Header);
