// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Grid, Button, Typography, withStyles,
} from '@material-ui/core';

type Props = {
  classes: Object,
};

const Home = ({ classes }: Props) => (
  <div className={classes.wrap}>
    <Grid className={classes.grid} container>
      <Grid item>
        <Typography className={classes.headline} variant="h5">
          Dimensionality reduction algorithms
        </Typography>
        <Typography variant="subtitle1" paragraph>
          In statistics, machine learning, and information theory, dimensionality reduction or
          dimension reduction is the process of reducing the number of random variables under
          consideration by obtaining a set of principal variables. It can be divided into feature
          selection and feature extraction.
        </Typography>
        <Button component={Link} to="/pca" variant="contained" color="primary">
          Principal component analysis
        </Button>
      </Grid>
    </Grid>
  </div>
);

const styles = theme => ({
  wrap: {
    padding: 20,
  },
  headline: {
    marginBottom: 16,
  },
  grid: {
    [theme.breakpoints.up('lg')]: {
      width: 1170,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
});

export default withStyles(styles)(Home);
