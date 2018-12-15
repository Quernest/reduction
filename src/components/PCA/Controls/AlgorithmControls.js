// @flow
import React from 'react';
import { Button, withStyles } from '@material-ui/core';
import styles from '../styles';

type Props = {
  classes: Object,
  onCalculate: () => void,
  onChartPlot: () => void,
  onDocumentDownload: () => void,
  calculating: boolean,
  calculated: boolean,
};

const AlgorithmControls = ({
  classes,
  onCalculate,
  onChartPlot,
  onDocumentDownload,
  calculating,
  calculated,
}: Props) => (
  <div className={classes.algorithmControls}>
    <Button className={classes.button} color="primary" variant="contained" onClick={onCalculate}>
      Calculate
    </Button>
    <Button className={classes.button} color="primary" variant="contained" onClick={onChartPlot}>
      Plot
    </Button>
    <Button
      className={classes.button}
      color="primary"
      variant="contained"
      onClick={onDocumentDownload}
    >
      Document
    </Button>
  </div>
);

export default withStyles(styles)(AlgorithmControls);
