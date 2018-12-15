// @flow
import React, { Component } from 'react';
import {
  Grid,
  Button,
  withStyles,
  LinearProgress,
  Tooltip,
} from '@material-ui/core';
import {
  some, filter, size, forEach, isEmpty, isNumber, isNull, has,
} from 'lodash';
import { Header, Chart } from '.';
import { Controls, UploadControls, AlgorithmControls } from './Controls';
import UploadWorker from './upload.worker';
import CalculateWorker from './calculate.worker';
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
  errors: Array<string>,
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
    errors: [],
  };

  fileInput: ?HTMLInputElement = React.createRef();

  componentDidMount() {
    // initialzie workers
    this.uploadWorker = new UploadWorker();
    this.calculateWorker = new CalculateWorker();
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

  onCalculate = (): void => {
    const { dataset }: Array<number[]> = this.state;

    this.setState({
      calculating: true,
      calculated: false,
    });

    // communication with worker
    this.calculateWorker.addEventListener(
      'message',
      (ev) => {
        const { data } = ev;
        const { scatterPoints, eigens } = data;

        const vectors = eigens.E.x;

        this.setState({
          calculating: false,
          calculated: true,
          scatterPoints,
          vectors,
        });
      },
      false,
    );

    // TODO: add timeout function (stop calculations if too long)
    // send the dataset to the worker
    this.calculateWorker.postMessage(dataset);
  };

  onChartPlot = (): void => {
    this.setState({
      plotting: false,
      plotted: true,
    });
  };

  onDocumentDownload = (): void => null;

  onFileSelectInputChange = (event: Event) => {
    const { files }: FileList = event.target;
    const [file]: File = files;

    this.setState({
      selectedFile: file,
    });
  };

  onFileUpload = () => {
    this.setState({
      uploaded: false,
      uploading: true,
    });

    const { selectedFile } = this.state;

    // communication with worker
    this.uploadWorker.addEventListener(
      'message',
      (event: MessageEvent) => {
        if (event.data.error) {
          const { errors } = this.state;

          this.setState({
            uploaded: false,
            uploading: false,
            errors: [...errors, event.data.error],
          });
        }
      },
      false,
    );

    // error handler
    this.uploadWorker.addEventListener('error', (event: ErrorEvent) => {
      if (event && has(event, 'message')) {
        const { errors } = this.state;

        // add one
        errors.push(event.message);

        this.setState({
          uploaded: false,
          uploading: false,
          errors,
        });
      }
    });

    // send selected file to the worker
    this.uploadWorker.postMessage(selectedFile);
  };

  onFileCancel = () => {
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
      vectors,
      errors,
    } = this.state;
    // const isVisibleProgressBar: boolean = uploading || calculating || plotting;
    // const isVisibleCalculateButton: boolean = uploaded && !calculated;
    // const hasErrors: boolean = !isEmpty(errors);

    return (
      <div className={classes.root}>
        <Header />
        <Controls>
          <UploadControls
            onFileUpload={this.onFileUpload}
            onFileSelectInputChange={this.onFileSelectInputChange}
            onFileCancel={this.onFileCancel}
            multiple={false}
            file={selectedFile}
            uploading={uploading}
            uploaded={uploaded}
          />
          <AlgorithmControls
            onCalculate={this.onCalculate}
            onChartPlot={this.onChartPlot}
            onDocumentDownload={this.onDocumentDownload}
            calculated={calculated}
            calculating={calculating}
            plotting={plotting}
            plotted={plotted}
          />
        </Controls>

        {/* <Controls
          onFileUpload={this.onFileUpload}
          onFileSelectInputChange={this.onFileSelectInputChange}
          onFileCancel={this.onFileCancel}
          onCalculate={this.onCalculate}
          onPlotChart={this.onChartPlot}
          onDownloadDocument={this.onDocumentDownload}
          multiple={false}
          file={selectedFile}
        /> */}

        <Grid className={classes.grid} container>
          <Grid item>
            {/* {!uploaded && (
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
            )} */}
            {/* <div>
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
              {plotted && <Chart points={scatterPoints} vectors={vectors} />}
            </div> */}
            {/* {isVisibleProgressBar && <LinearProgress className={classes.linearProgress} />} */}
            {/* {hasErrors && (
              <div>
                {forEach(errors, error => (
                  <p>{error}</p>
                ))}
              </div>
            )} */}
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(Main);
