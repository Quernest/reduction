// @flow
import React, { Component } from 'react';
import { withStyles, Grid } from '@material-ui/core';
import {
  some, filter, size, forEach, isEmpty, isNumber, isNull, has,
} from 'lodash';
import { Header, Chart } from '.';
import { UploadWorker, CalculateWorker } from './WebWorkers'; // eslint-disable-line
import { Controls, UploadControls, AlgorithmControls } from './Controls';
import ProgressBar from '../ProgressBar';
import styles from './styles';

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
  error: string,
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
    error: '',
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

    // reset input
    // to be able to upload the same file again if it was canceled
    event.target.value = '';

    this.setState({
      selectedFile: file,
    });
  };

  onFileUpload = () => {
    this.setState({
      error: '',
      uploaded: false,
      uploading: true,
    });

    const { selectedFile } = this.state;

    // communication with worker
    this.uploadWorker.addEventListener(
      'message',
      (event: MessageEvent) => {
        this.setState({
          uploaded: true,
          uploading: false,
          dataset: event.data,
        });
      },
      false,
    );

    // error handler
    this.uploadWorker.addEventListener('error', (event: ErrorEvent) => {
      this.setState({
        uploaded: false,
        uploading: false,
        error: event.message,
      });
    });

    // send selected file to the worker
    this.uploadWorker.postMessage(selectedFile);
  };

  onFileCancel = () => {
    this.setState({
      selectedFile: null,
      uploaded: false,
      error: '',
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
      selectedFile,
      scatterPoints,
      vectors,
      error, // TODO: display error in modal or smth else
    } = this.state;

    return (
      <div className={classes.root}>
        <Grid className={classes.grid} container>
          <Grid item>
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
                uploaded={uploaded}
                calculated={calculated}
                calculating={calculating}
                plotting={plotting}
                plotted={plotted}
              />
            </Controls>
            <ProgressBar active={uploading || calculating} />
            {plotted && <Chart points={scatterPoints} vectors={vectors} />}
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(Main);
