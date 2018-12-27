// @flow

import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

type Props = {
  classes: Object,
  active: boolean,
};

const ProgressBar = ({ classes, active }: Props) => {
  if (active) {
    return <LinearProgress className={classes.linearProgressBar} />;
  }

  return null;
};

const styles = {
  linearProgressBar: {
    width: '100%',
  },
};

export default withStyles(styles)(ProgressBar);
