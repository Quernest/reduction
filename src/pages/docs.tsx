import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import React from "react";
import { useTranslation } from 'react-i18next';

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
  },
  divider: {
    marginBottom: theme.spacing(3)
  },
  blockquote: {
    margin: theme.spacing(3, 0),
    padding: theme.spacing(1 / 2, 3),
    borderLeft: "5px solid rgba(0, 0, 0, 0.38)"
  },
  blockquoteText: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  downloadBtn: {
    marginBottom: theme.spacing(2)
  }
}));

export const DocsPage = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.root}>
      <div className={classes.wrap}>
        <Typography variant="h1" gutterBottom={true}>
          {t('pages.docs.title')}
        </Typography>
        <Divider className={classes.divider} />
        <blockquote className={classes.blockquote}>
          <Typography variant="body1" className={classes.blockquoteText}>
            {t('pages.docs.alert')}
          </Typography>
        </blockquote>
        <Divider className={classes.divider} />
        <Typography variant="h2" gutterBottom={true}>
          {t('pages.docs.datasetTitle')}
        </Typography>
        <Typography variant="body1" paragraph={true}>
          {t('pages.docs.datasetFormatPart1')}{" "}
          <Link href="https://en.wikipedia.org/wiki/Comma-separated_values">
            {t('pages.docs.datasetFormat')}
          </Link>{" "}
          {t('pages.docs.datasetFormatPart2')}
        </Typography>
        <Typography variant="body1" color="secondary" paragraph={true}>
          <Typography variant="button" color="secondary">
            {t('pages.docs.important')}!
          </Typography>{" "}
          {t('pages.docs.importantInfo')}:
        </Typography>
        <ul>
          <li>
            <Typography variant="body1" gutterBottom={true}>
              {t('pages.docs.importantInfoPart1')}
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom={true}>
              {t('pages.docs.importantInfoPart2')}
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom={true}>
              {t('pages.docs.importantInfoPart3')}
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom={true}>
              {t('pages.docs.importantInfoPart4')}
            </Typography>
          </li>
        </ul>
        <Typography variant="body1" paragraph={true}>
          {t('pages.docs.example')}:
        </Typography>
        <Button
          className={classes.downloadBtn}
          color="primary"
          href="https://gist.github.com/Quernest/d8b8d8be49c6acbbe00ea8cd0f2f16c2/archive/99c522cf29f2a2c764e6c814de8165c07c8a0975.zip"
          variant="outlined"
        >
          {t('pages.docs.downloadButton')}
        </Button>
        <Typography variant="body1" paragraph={true}>
          {t('pages.docs.aboutExample')}
        </Typography>
      </div>
    </div>
  );
};
