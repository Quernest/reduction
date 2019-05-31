import { Theme } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import React from "react";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
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
