import { Theme } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import React from "react";

const useStyles = makeStyles(({ spacing }: Theme) => ({
  root: {
    flexGrow: 1,
    paddingTop: spacing.unit,
    paddingBottom: spacing.unit
  }
}));

interface IProps {
  text?: string;
}

export const ErrorMessage = ({ text }: IProps): JSX.Element => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Typography variant="body1" color="error">
        Error: {text}
      </Typography>
    </div>
  );
};
