import { createStyles, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { StyleRules, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import * as React from "react";

const styles = ({ breakpoints, spacing }: Theme): StyleRules =>
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
  location: Location;
}

export const Page404 = withStyles(styles)(({ classes, location }: IProps) => (
  <div className={classes.root}>
    <div className={classes.wrap}>
      <Grid
        container={true}
        alignItems="center"
        justify="center"
        className={classes.grid}
      >
        <Typography variant="headline" color="textSecondary">
          404. No match found for <code>{location.pathname}</code>
        </Typography>
      </Grid>
    </div>
  </div>
));
