import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import React from "react";

const useStyles = makeStyles(({ breakpoints, spacing }: Theme) => ({
  root: {
    flexGrow: 1,
    padding: spacing.unit * 2,
    [breakpoints.up("sm")]: {
      padding: spacing.unit * 3
    }
  },
  wrap: {
    width: "100%",
    maxWidth: breakpoints.values.md,
    marginLeft: "auto",
    marginRight: "auto"
  }
}));

interface IProps {
  location: Location;
}

export function Page404({ location }: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.wrap}>
        <Typography variant="headline" color="textSecondary">
          404. No match found for <code>{location.pathname}</code>
        </Typography>
      </div>
    </div>
  );
}
