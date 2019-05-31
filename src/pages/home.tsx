import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import DashboardIcon from "@material-ui/icons/Dashboard";
import MultilineChartIcon from "@material-ui/icons/MultilineChart";
import { makeStyles } from "@material-ui/styles";
import React from "react";
import { useTranslation } from 'react-i18next';
import { redirectTo } from "src/utils";

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
    marginRight: "auto",
    paddingBottom: theme.spacing(3)
  },
  icon: {
    fontSize: 30,
    marginRight: theme.spacing(2)
  },
  iconTitleWrap: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1.75)
  }
}));

export const HomePage = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.root}>
      <div className={classes.wrap}>
        <Grid container={true} alignItems="flex-start" spacing={2}>
          <Grid item={true} xs={12}>
            <Typography variant="h1" gutterBottom={true}>
              {t('pages.home.title')}
            </Typography>
            <Typography variant="body1" paragraph={true}>
              {t('pages.home.description')}
            </Typography>
          </Grid>
          <Grid item={true} xs={12} md={6}>
            <div className={classes.iconTitleWrap}>
              <MultilineChartIcon color="primary" className={classes.icon} />
              <Typography variant="h2">{t('pages.home.pca.title')}</Typography>
            </div>
            <Typography variant="body1" paragraph={true}>
              {t('pages.home.pca.description')}
            </Typography>
            <Button {...redirectTo("/pca")} color="primary" variant="contained">
              {t('pages.home.pca.button')}
            </Button>
          </Grid>
          <Grid item={true} xs={12} md={6}>
            <div className={classes.iconTitleWrap}>
              <DashboardIcon color="primary" className={classes.icon} />
              <Typography variant="h2">{t('pages.home.som.title')}</Typography>
            </div>
            <Typography variant="body1" paragraph={true}>
              {t('pages.home.som.description')}
            </Typography>
            <Button {...redirectTo("/som")} color="primary" variant="contained">
              {t('pages.home.som.button')}
            </Button>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};
