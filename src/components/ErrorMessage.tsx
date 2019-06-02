import { Theme } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import React from "react";
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  }
}));

interface IErrorMessageProps {
  /**
   * i18n key or text message
   */
  text?: string;
}

export const ErrorMessage: React.FC<IErrorMessageProps> = ({ text }) => {
  if (text) {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
      <div className={classes.root}>
        <Typography variant="body1" color="error">
          {t('error')}: {t(text)}
        </Typography>
      </div>
    );
  }

  return null;
};
