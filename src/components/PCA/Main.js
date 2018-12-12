// @flow
import React, { Component } from 'react';
import {
  Grid, Button, Typography, withStyles, LinearProgress, Tooltip,
} from '@material-ui/core';
import {
  some, filter, isEmpty, isNumber, isNull, has,
} from 'lodash';
import Dropzone from 'react-dropzone';
import Papa from 'papaparse';
import styles from './styles';
import { Chart } from '.';
import PCA from './PCA';

/**
 * TODO:
 * 1) dynamic form for adding factors
 * 2) logic for plotting scatterplot
 * 3) pass vecotrs coordinates to Chart component
 * 4) comments
 * 5) add alerts and info 'how to use' PCA
 */

type Props = {
  classes: Object,
};

type State = {
  dataset: Array<number[]>,
  scatterPoints: Array<{
    x: number,
    y: number,
  }>,
  // chart plotting process
  plotting: boolean,
  plotted: boolean,
  // calculating process
  calculating: boolean,
  calculated: boolean,
  // file uploading process
  uploading: boolean,
  uploaded: boolean,
};

class Main extends Component<Props, State> {
  state = {
    dataset: [],
    scatterPoints: [],
    plotting: false,
    plotted: false,
    calculating: false,
    calculated: false,
    uploading: false,
    uploaded: false,
  };

  onUpload = (acceptedFiles: Array<File>, rejectedFiles: Array<File>) => {
    if (rejectedFiles.length) {
      throw new Error('this file rejected');
    }

    if (isEmpty(acceptedFiles)) {
      throw new Error('no files found!');
    }

    this.setState({
      uploading: true,
      uploaded: false,
    });

    const [file] = acceptedFiles;

    if (!file) {
      throw new Error('Uploading error');
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: this.onParseComplete,
    });
  };

  validate = (results: Object): boolean => {
    if (isEmpty(results)) {
      throw new Error('results not found!');
    }

    if (results && !has(results, 'data')) {
      throw new Error('passed results have not data array');
    }

    const { data } = results;

    const wrongValues: Array<Object> = filter(
      data,
      (obj: any): boolean => some(obj, (value: any): boolean => !isNumber(value) || isNull(value)),
    );

    if (!isEmpty(wrongValues)) {
      // TODO: set error code to the state
      // console.error('Validation error. The dataset has some wrong values');
      return false;
    }

    this.setState({
      dataset: data,
    });

    return true;
  };

  calculate = (): void => {
    const { dataset } = this.state;

    console.time('PCA performance');
    console.log('==========================================');

    this.setState({
      calculating: true,
      calculated: false,
    });

    const pca = new PCA(dataset);

    console.log('normalized dataset', pca.normalizedDataset);
    console.log('covariance', pca.covariance);
    console.log('points', pca.scatterPoints);
    console.log('eigens', pca.eigens);
    console.log('analysis', pca.analysis);

    this.setState({
      calculating: false,
      calculated: true,
      scatterPoints: pca.scatterPoints,
    });

    console.log('==========================================');
    console.timeEnd('PCA performance');
  };

  plot = (): void => {
    console.log('==========================================');
    console.log('plotting ...');

    this.setState({
      plotting: false,
      plotted: true,
    });

    // setTimeout(() => this.setState({ plotted: true, plotting: false }), 1000);
    console.log('==========================================');
  };

  download = (): void => null;

  onParseComplete = (results: Object) => {
    const isValid: boolean = this.validate(results);

    // TODO: handle else statement
    if (isValid) {
      this.setState({
        uploading: false,
        uploaded: true,
      });
    }
  };

  onFileDialogCancel = (e) => {};

  checkFileTypes = ({
    isDragAccept, isDragReject, acceptedFiles, rejectedFiles,
  }): string => {
    if (!isEmpty(acceptedFiles)) {
      return `Accepted ${acceptedFiles.length} files`;
    }

    if (!isEmpty(rejectedFiles)) {
      return `Rejected ${rejectedFiles.length} files`;
    }

    if (isDragAccept) {
      return 'This file is authorized';
    }

    if (isDragReject) {
      return 'This file is not authorized';
    }

    return 'Drop .txt or .csv file here';
  };

  render() {
    const { classes } = this.props;
    const {
      uploading,
      uploaded,
      calculating,
      calculated,
      plotting,
      plotted,
      scatterPoints,
    } = this.state;

    const isVisibleProgressBar: boolean = uploading || calculating || plotting;
    const isVisibleCalculateButton: boolean = uploaded && !calculated;

    return (
      <div className={classes.root}>
        <Grid className={classes.grid} container>
          <Grid item>
            <Typography className={classes.title} variant="h5">
              Principal component analysis
            </Typography>
            <Typography variant="subtitle1">
              Principal component analysis (PCA) is a statistical procedure that uses an orthogonal
              transformation to convert a set of observations of possibly correlated variables
              (entities each of which takes on various numerical values) into a set of values of
              linearly uncorrelated variables called principal components.
            </Typography>
            <div className={classes.dropZoneWrap}>
              {!calculated && (
                <Dropzone
                  className={classes.dropZone}
                  activeClassName={classes.activeDropZone}
                  rejectClassName={classes.rejectedDropZone}
                  multiple={false}
                  accept="text/x-csv, text/plain, application/vnd.ms-excel"
                  onDrop={this.onUpload}
                  onFileDialogCancel={this.onFileDialogCancel}
                >
                  {props => this.checkFileTypes(props)}
                </Dropzone>
              )}
            </div>
            <div>
              {isVisibleCalculateButton && (
                <Button
                  className={classes.btnCalculate}
                  color="primary"
                  variant="contained"
                  onClick={this.calculate}
                  disabled={calculating}
                >
                  Calculate
                </Button>
              )}
              {calculated && (
                <Button
                  className={classes.btnCalculate}
                  color="primary"
                  variant="contained"
                  onClick={this.plot}
                  disabled={plotting || plotted}
                >
                  Plot
                </Button>
              )}
              {calculated && (
                <Tooltip title="Download results in Microsoft Word .docx format">
                  <Button
                    className={classes.btnDownload}
                    color="primary"
                    variant="contained"
                    onClick={this.download}
                  >
                    Word
                  </Button>
                </Tooltip>
              )}
              {plotted && <Chart points={scatterPoints} />}
            </div>
            {isVisibleProgressBar && <LinearProgress className={classes.linearProgress} />}
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(Main);
