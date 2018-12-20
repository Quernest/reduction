// @flow
import React, { Component } from 'react';
import { withStyles, Grid, Typography } from '@material-ui/core';
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
  plotting: boolean,
  plotted: boolean,
  calculating: boolean,
  calculated: boolean,
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

  componentDidMount() {
    // initialzie workers
    this.uploadWorker = new UploadWorker();
    this.calculateWorker = new CalculateWorker();
  }

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

    // error handler
    this.calculateWorker.addEventListener('error', (event: ErrorEvent) => {
      this.setState({
        uploaded: false,
        uploading: false,
        error: event.message,
      });
    });

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
    event.target.value = ''; // eslint-disable-line

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
      error,
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
            {/* errors should be as list */}
            {
              <Typography variant="body1" color="error">
                {error.toString()}
              </Typography>
            }
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(Main);
