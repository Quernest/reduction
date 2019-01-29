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
    wrap: {
      width: "100%",
      maxWidth: breakpoints.values.md,
      marginLeft: "auto",
      marginRight: "auto"
    }
  });

interface IProps {
  classes?: any;
}

export const Header = withStyles(styles)(({ classes }: IProps) => (
  <header className={classes.root}>
    <AppBar position="static">
      <Toolbar>
        <div className={classes.wrap}>
          <Grid container={true} alignItems="center">
            <Typography variant="h6" color="inherit" className={classes.grow}>
              Reduction
            </Typography>
            <Button {...redirectTo("/")} variant="text" color="inherit">
              Home
            </Button>
            <Button {...redirectTo("/pca")} variant="text" color="inherit">
              PCA
            </Button>
            <Button {...redirectTo("/som")} variant="text" color="inherit">
              SOM
            </Button>
          </Grid>
        </div>
      </Toolbar>
    </AppBar>
  </header>
));
