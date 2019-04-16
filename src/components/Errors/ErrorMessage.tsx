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

interface IErrorMessageProps {
  text?: string;
}

export const ErrorMessage: React.FC<IErrorMessageProps> = ({ text }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Typography variant="body1" color="error">
        Error: {text}
      </Typography>
    </div>
  );
};
