import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import {
  createStyles,
  StyleRules,
  Theme,
  withStyles
} from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import * as React from "react";
import { redirectTo } from "src/utils/redirectTo";

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
            <Button {...redirectTo("/")} variant="text" color="inherit">
              Home
            </Button>
            <Button {...redirectTo("/pca")} variant="text" color="inherit">
              PCA
            </Button>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  </header>
));
