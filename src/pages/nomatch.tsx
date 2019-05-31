import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import React from "react";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      padding: theme.spacing(3)
    }
  },
  wrap: {
    width: "100%",
    maxWidth: theme.breakpoints.values.lg,
    marginLeft: "auto",
    marginRight: "auto"
  }
}));

interface INoMatchProps {
  location: Location;
}

export const NoMatch: React.FC<INoMatchProps> = ({ location }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.wrap}>
        <Typography variant="h1" color="textSecondary">
          404. No match found for <code>{location.pathname}</code>
        </Typography>
      </div>
    </div>
  );
};
