// @flow
import React from 'react';
import { withStyles } from '@material-ui/core';
import styles from '../styles';

type Props = {
  classes: Object,
  children: React.Node,
};

const Controls = ({ classes, children }: Props) => (
  <div className={classes.controls}>{children}</div>
);

export default withStyles(styles)(Controls);
