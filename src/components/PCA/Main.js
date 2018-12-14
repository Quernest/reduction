// @flow
import React, { Component } from 'react';
import {
  Grid,
  Button,
  IconButton,
  Typography,
  withStyles,
  LinearProgress,
  Tooltip,
} from '@material-ui/core';
import {
  some, filter, size, forEach, isEmpty, isNumber, isNull, isArray, has,
} from 'lodash';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import DeleteIcon from '@material-ui/icons/Delete';
import { Chart } from '.';
import Worker from './Worker';
import WebWorker from '../../utils/WebWorker';
import PCA from './PCA';
import styles from './styles';

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
  selectedFile: File,
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
    selectedFile: null,
    dataset: [],
    scatterPoints: [],
    plotting: false,
    plotted: false,
    calculating: false,
    calculated: false,
    uploading: false,
    uploaded: false,
  };

  fileInput: ?HTMLInputElement = React.createRef();

  componentDidMount() {
    this.worker = new WebWorker(Worker);
  }

  validate = (results: Object): boolean => {
    if (isEmpty(results)) {
      throw new Error('results not found!');
    }

    if (results && !has(results, 'data')) {
      throw new Error('passed results have not data array');
    }

    const { data }: Array<{ value: ?number }> = results;

    // check dataset object size
    forEach(data, (object: Object) => {
      if (size(object) < 2) {
        throw new Error('The object of dataset must contain more than 2 factors.');
      }
    });

    // check if valid dataset object values
    const wrongValues: Array<Object> = filter(data, (object: Object) => some(object, (value: number | string) => isNull(value) || !isNumber(value)));

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
    const { dataset }: Array<number[]> = this.state;

    this.setState({
      calculating: true,
      calculated: false,
    });

    // maybe calculate it in the worker?
    const pca = new PCA(dataset);

    const { scatterPoints } = pca;

    this.setState({
      calculating: false,
      calculated: true,
      scatterPoints,
    });
  };

  plot = (): void => {
    this.setState({
      plotting: false,
      plotted: true,
    });
  };

  fileSelectedHandler = (event: Event) => {
    const { files }: FileList = event.target;
    const [file]: File = files;

    this.setState({
      selectedFile: file,
    });
  };

  fileUploadHandler = () => {
    this.setState({
      uploaded: false,
      uploading: true,
    });

    const { selectedFile } = this.state;

    // communication with worker
    this.worker.addEventListener('message', (event: MessageEvent) => {
      if (isArray(event.data)) {
        const dataset: Array<number[]> = event.data;

        this.setState({
          uploaded: true,
          uploading: false,
          dataset,
        });
      }
    }, false);

    // send selected file to the worker
    this.worker.postMessage(selectedFile);
  };

  fileCancelHandler = () => {
    this.setState({
      selectedFile: null,
      uploaded: false,
    });
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
      selectedFile,
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

            {!uploaded && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  className={classes.button}
                  onClick={() => this.fileInput.current.click()}
                  disabled={uploading || !isNull(selectedFile)}
                >
                  Pick csv file
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  onClick={this.fileUploadHandler}
                  disabled={uploading || isNull(selectedFile)}
                >
                  Upload
                  <CloudUploadIcon className={classes.rightIcon} />
                </Button>
                <input
                  style={{ display: 'none' }}
                  ref={this.fileInput}
                  type="file"
                  onChange={this.fileSelectedHandler}
                  multiple={false}
                  hidden
                />
                {!isNull(selectedFile) && !uploading && (
                  <div className={classes.file}>
                    <Typography variant="body2">
                      {selectedFile.name}
                      <IconButton
                        aria-label="delete"
                        className={classes.margin}
                        onClick={this.fileCancelHandler}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Typography>
                  </div>
                )}
              </>
            )}

            <div>
              {isVisibleCalculateButton && (
                <Button
                  className={classes.button}
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
                  className={classes.button}
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
                    className={classes.button}
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
