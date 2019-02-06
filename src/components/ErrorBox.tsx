import { Theme } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import * as React from "react";

const useStyles = makeStyles(({ spacing }: Theme) => ({
  root: {
    flexGrow: 1,
    paddingTop: spacing.unit,
    paddingBottom: spacing.unit
  }
}));

interface IProps {
  message?: string;
}

export function ErrorBox({ message }: IProps) {
  const classes = useStyles();

  if (message) {
    return (
      <div className={classes.root}>
        <Typography variant="body1" color="error">
          Error: {message}
        </Typography>
      </div>
    );
  }

  return null;
}
