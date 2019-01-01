// @flow
import React from 'react';
import type { Node } from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

type Props = {
  classes: Object,
};

const Header = ({ classes }: Props): Node => (
  <header className={classes.root}>
    <AppBar position="static">
      <Toolbar>
        <Grid container justify="center">
          <Grid container alignItems="center" className={classes.grid}>
            <Typography variant="h6" color="inherit" className={classes.grow}>
              Logo
            </Typography>
            <Button variant="text" color="inherit" component={Link} to="/">
              Home
            </Button>
            <Button variant="text" color="inherit" component={Link} to="/pca">
              PCA
            </Button>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  </header>
);

const styles = ({ breakpoints: { up, values } }) => ({
  root: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
  },
  grid: {
    [up('md')]: {
      width: values.md,
    },
  },
});

export default withStyles(styles)(Header);
