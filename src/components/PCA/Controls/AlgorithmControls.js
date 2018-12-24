// @flow
import React from 'react';
import { Button, withStyles } from '@material-ui/core';
import styles from '../styles';

type Props = {
  classes: Object,
  onCalculate: () => void,
  onChartPlot: () => void,
  onDocumentDownload: () => void,
  uploaded: boolean,
  calculating: boolean,
  calculated: boolean,
  plotting: boolean,
  plotted: boolean,
};

const AlgorithmControls = ({
  classes,
  onCalculate,
  onChartPlot,
  onDocumentDownload,
  uploaded,
  calculating,
  calculated,
  plotted,
}: Props) => {
  if (calculated) {
    return (
      <div className={classes.algorithmControls}>
        <Button
          className={classes.button}
          color="primary"
          variant="contained"
          onClick={onChartPlot}
          disabled={plotted}
        >
          Plot
        </Button>
        <Button
          className={`${classes.button} ${classes.marginLeft}`}
          color="primary"
          variant="contained"
          onClick={onDocumentDownload}
          disabled
        >
          Document
        </Button>
      </div>
    );
  }

  if (uploaded && !calculated) {
    return (
      <Button
        className={classes.button}
        color="primary"
        variant="contained"
        onClick={onCalculate}
        disabled={calculating}
      >
        Calculate
      </Button>
    );
  }

  return null;
};

export default withStyles(styles)(AlgorithmControls);
