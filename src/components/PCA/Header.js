import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import styles from './styles';

type Props = {
  classes: Object,
};

function Header({ classes }: Props) {
  return (
    <header>
      <Typography className={classes.title} variant="h5">
        Principal component analysis
      </Typography>
      <Typography variant="subtitle1">
        Principal component analysis (PCA) is a statistical procedure that uses an orthogonal
        transformation to convert a set of observations of possibly correlated variables (entities
        each of which takes on various numerical values) into a set of values of linearly
        uncorrelated variables called principal components.
      </Typography>
    </header>
  );
}

export default withStyles(styles)(Header);
