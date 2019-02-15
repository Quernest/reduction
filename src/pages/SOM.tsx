import { Typography } from "@material-ui/core";
import { Theme } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/styles";
import React from "react";

const useStyles = makeStyles(({ spacing, breakpoints }: Theme) => ({
  root: {
    flexGrow: 1,
    padding: spacing.unit * 2,
    [breakpoints.up("sm")]: {
      padding: spacing.unit * 3
    }
  },
  wrap: {
    width: "100%",
    maxWidth: breakpoints.values.lg,
    marginLeft: "auto",
    marginRight: "auto"
  }
}));

/**
 * self-organizing maps
 * main page
 */
export const SOM = (): JSX.Element => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.wrap}>
        <Typography variant="h5" paragraph={true}>
          Self-Organizing Map
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph={true}>
          In development
        </Typography>
      </div>
    </div>
  );
};
