// @flow

import React from 'react';
import { LinearProgress, withStyles } from '@material-ui/core';

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
