// @flow
import React from 'react';
import type { Node } from 'react';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import map from 'lodash/map';
import * as math from 'mathjs';
import Table from './Table';
import CalculateWorker from './calculate.worker';
import UploadWorker from './upload.worker';
import Bar from './Bar';
import Biplot from './Biplot';

type Props = {
  classes: Object,
};

type State = {
  selectedFile: File,
  dataset: Array<number[]>,
  calculations: {
    scatterPoints: Array<{
      x: number,
      y: number,
    }>,
    adjustedDataset: Array<number[]>,
    covariance: Array<number[]>,
    eigens: {
      lambda: {
        x: Array<number[]>,
        y: Array<number[]>,
      },
      E: {
        x: Array<number>,
        y: Array<number>,
      },
    },
    linearCombinations: Array<number[]>,
    names: Array<string>,
  },
  visualize: boolean,
  calculating: boolean,
  calculated: boolean,
  uploading: boolean,
  uploaded: boolean,
  error: string,
};

class Page extends React.Component<Props, State> {
  state = {
    selectedFile: null,
    dataset: [],
    calculations: {
      scatterPoints: [],
      adjustedDataset: [],
      covariance: [],
      eigens: {},
      linearCombinations: [],
    },
    visualize: false,
    calculating: false,
    calculated: false,
    uploading: false,
    uploaded: false,
    error: '', // todo: handle array
  };

  fileInput: ?HTMLInputElement = React.createRef();

  componentDidMount() {
    this.initializeWebWorkers();
  }

  initializeWebWorkers() {
    this.calculateWorker = new CalculateWorker();
    this.uploadWorker = new UploadWorker();
  }

  onCalculate = (e: Event): void => {
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

        this.setState({
          calculating: false,
          calculated: true,
          calculations: data,
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

  onFileSelectInputChange = (e: Event): void => {
    const { files }: FileList = event.target;
    const [file]: File = files;

    // get type of file
    const currentFileExtension: string = file.name.substring(
      file.name.lastIndexOf('.'),
    );

    // list of accepted file extensions
    const acceptedExtensions: Array<string> = ['.txt', '.csv'];

    // return the error if it's not .csv extension
    if (acceptedExtensions.indexOf(currentFileExtension) < 0) {
      this.setState({
        error: `Invalid file selected, valid files are of ${acceptedExtensions.toString()} types.`,
      });

      return;
    }

    // reset input
    // to be able to upload the same file again if it was canceled
    event.target.value = ''; // eslint-disable-line

    this.setState(
      {
        selectedFile: file,
      },
      this.clearErrorBox,
    );
  };

  onFileUpload = (e: Event): void => {
    this.setState(
      {
        uploaded: false,
        uploading: true,
      },
      this.clearErrorBox,
    );

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
    this.setState(
      {
        selectedFile: null,
        uploaded: false,
      },
      this.clearErrorBox,
    );
  };

  onVisualize = () => {
    this.setState({
      visualize: true,
    });
  };

  clearErrorBox() {
    this.setState({ error: '' });
  }

  render(): Node {
    const { classes } = this.props;
    const {
      uploading,
      uploaded,
      calculating,
      calculated,
      visualize,
      selectedFile,
      dataset,
      calculations,
      error,
    } = this.state;
    const {
      linearCombinations,
      adjustedDataset,
      covariance,
      scatterPoints,
      eigens,
      names,
      analysis,
    } = calculations;

    return (
      <div className={classes.root}>
        <Grid container justify="center">
          <Grid container className={classes.grid} alignItems="center">
            <Typography variant="h6" paragraph>
              Principal Component Analysis
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" paragraph>
              Principal component analysis (PCA) is a statistical procedure that
              uses an orthogonal transformation to convert a set of observations
              of possibly correlated variables (entities each of which takes on
              various numerical values) into a set of values of linearly
              uncorrelated variables called principal components.
            </Typography>
            {(() => {
              if (uploading || calculating) {
                return (
                  <Grid container justify="center">
                    <CircularProgress className={classes.progress} />
                  </Grid>
                );
              }

              if (visualize) {
                return (
                  <>
                    <Biplot
                      points={scatterPoints}
                      vectors={eigens.E.x}
                      names={names}
                      analysis={analysis}
                    />
                    <Bar
                      values={eigens.lambda.x}
                      names={names}
                      analysis={analysis}
                    />
                  </>
                );
              }

              if (calculated) {
                return (
                  <React.Fragment>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={this.onVisualize}
                      className={classes.btnVisualize}
                    >
                      Visualize
                    </Button>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        Count of observations: {dataset.length}
                      </Typography>
                      <Typography variant="subtitle1">
                        Count of factors: {names.length}
                      </Typography>
                    </Grid>
                    <Grid className={classes.tableBox} item xs={12}>
                      <Typography variant="h5">Original dataset</Typography>
                      <Table rows={dataset} columns={names} />
                    </Grid>
                    <Grid className={classes.tableBox} item xs={12}>
                      <Typography variant="h5">Adjusted dataset</Typography>
                      <Table rows={adjustedDataset} columns={names} />
                    </Grid>
                    <Grid className={classes.tableBox} item xs={12}>
                      <Typography variant="h5">Covariation Matrix</Typography>
                      <Table rows={covariance} columns={names} />
                    </Grid>
                    <Grid className={classes.tableBox} item xs={12}>
                      <Typography variant="h5" className={classes.h5}>
                        Eigenanalysis of the Covariation Matrix
                      </Typography>
                      <Table
                        enumerateSymbol="Component"
                        rows={[eigens.lambda.x, analysis]}
                        columns={['Eigenvalue', 'Proportion, %']}
                      />
                    </Grid>
                    <Grid className={classes.tableBox} item xs={12}>
                      <Typography variant="h5" className={classes.h5}>
                        Eigenvectors (component loadings)
                      </Typography>
                      <Table
                        rows={math.transpose(eigens.E.x)}
                        columns={map(
                          names,
                          (name, index) => `PC${index + 1} (${name})`,
                        )}
                      />
                    </Grid>
                    <Grid className={classes.tableBox} item xs={12}>
                      <Typography variant="h5">Linear Combinations</Typography>
                      <Table rows={linearCombinations} columns={names} />
                    </Grid>
                  </React.Fragment>
                );
              }

              if (uploaded) {
                return (
                  <React.Fragment>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={this.onCalculate}
                    >
                      Calculate
                    </Button>
                    <Grid className={classes.tableBox} item xs={12}>
                      <Typography variant="h6">Your dataset</Typography>
                      <Table rows={dataset} />
                    </Grid>
                  </React.Fragment>
                );
              }

              return (
                <Grid item xs={12}>
                  <input
                    ref={this.fileInput}
                    onChange={this.onFileSelectInputChange}
                    type="file"
                    // accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    multiple={false}
                    hidden
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => this.fileInput.current.click()}
                  >
                    choose a file
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    disabled={!selectedFile}
                    onClick={this.onFileUpload}
                  >
                    Upload
                    <CloudUploadIcon className={classes.rightIcon} />
                  </Button>
                  {selectedFile && (
                    <Grid item xs={12}>
                      <Chip
                        label={selectedFile.name}
                        onDelete={this.onFileCancel}
                        className={classes.chip}
                      />
                    </Grid>
                  )}
                </Grid>
              );
            })()}
            {error && (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            )}
          </Grid>
        </Grid>
      </div>
    );
  }
}

const styles = ({ spacing: { unit }, breakpoints: { up, values } }) => ({
  root: {
    flexGrow: 1,
    padding: unit * 2,
    [up('sm')]: {
      padding: unit * 3,
    },
  },
  grid: {
    [up('md')]: {
      width: values.md,
    },
  },
  button: {
    margin: unit,
  },
  btnVisualize: {
    marginBottom: unit * 2,
  },
  rightIcon: {
    marginLeft: unit,
  },
  chip: {
    marginTop: unit,
    marginBottom: unit,
  },
  tableBox: {
    marginTop: unit * 2,
    marginBottom: unit * 2,
  },
  h5: {
    marginTop: unit * 2,
  },
});

export default withStyles(styles)(Page);