import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

type Props = {
  classes: Object,
};

const NotFound = ({ classes }: Props) => (
  <div className={classes.root}>
    <Typography variant="headline" align="center">
      404. The page not found!
    </Typography>
  </div>
);

const styles = {
  root: {
    padding: '50px 25px',
  },
};

export default withStyles(styles)(NotFound);
