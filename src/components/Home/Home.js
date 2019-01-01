// @flow
import React from 'react';
import type { Node } from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

type Props = {
  classes: Object,
};

const Home = ({ classes }: Props): Node => (
  <div className={classes.root}>
    <Grid container justify="center">
      <Grid className={classes.grid} container alignItems="center">
        <Button component={Link} to="pca" variant="contained">
          Principal Component Analysis
        </Button>
      </Grid>
    </Grid>
  </div>
);

const styles = ({ spacing: { unit }, breakpoints: { up, values } }) => ({
  root: {
    flexGrow: 1,
    padding: unit * 2,
    [up('sm')]: {
      padding: unit * 3,
    },
  },
  grid: {
    [up('md')]: {
      width: values.md,
    },
  },
});

export default withStyles(styles)(Home);
