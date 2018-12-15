import React from 'react';
import { Grid, Typography, withStyles } from '@material-ui/core';
import styles from './styles';

type Props = {
  classes: Object,
};

function Header({ classes }: Props) {
  return (
    <header>
      <Grid className={classes.grid} container>
        <Grid item>
          <Typography className={classes.title} variant="h5">
            Principal component analysis
          </Typography>
          <Typography variant="subtitle1">
            Principal component analysis (PCA) is a statistical procedure that uses an orthogonal
            transformation to convert a set of observations of possibly correlated variables
            (entities each of which takes on various numerical values) into a set of values of
            linearly uncorrelated variables called principal components.
          </Typography>
        </Grid>
      </Grid>
    </header>
  );
}

export default withStyles(styles)(Header);
