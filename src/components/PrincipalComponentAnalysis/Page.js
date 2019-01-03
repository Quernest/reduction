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
import MaterialTable from 'material-table';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import map from 'lodash/map';
import keys from 'lodash/keys';
import head from 'lodash/head';
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

    // reset input
    // to be able to upload the same file again if it was canceled
    event.target.value = ''; // eslint-disable-line

    this.setState({
      selectedFile: file,
    });
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
      scatterPoints, eigens, names, analysis,
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
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={this.onVisualize}
                  >
                    Visualize
                  </Button>
                );
              }

              if (uploaded) {
                const columns = ['№', ...keys(head(dataset))].map(
                  (element: string, index: number): Object => ({
                    cellStyle:
                      index === 0
                        ? {
                          width: 30,
                        }
                        : undefined,
                    title: element,
                    field: element,
                    type: 'numeric',
                  }),
                );
              
                const data: Array<Object> = map(
                  dataset,
                  (element: Object, index: number): Object => ({
                    '№': index + 1,
                    ...element,
                  }),
                );

                return (
                  <React.Fragment>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={this.onCalculate}
                    >
                      Calculate
                    </Button>
                    <div style={{ maxWidth: '100%', width: '100%', marginTop: 30, marginBottom: 30 }}>
                      <MaterialTable
                        options={{
                          search: false,
                          sorting: false,
                          toolbar: false,
                        }}
                        icons={{
                          FirstPage: FirstPageIcon,
                          LastPage: LastPageIcon,
                          NextPage: KeyboardArrowRight,
                          PreviousPage: KeyboardArrowLeft,
                        }}
                        columns={columns}
                        data={data}
                        title="Dataset"
                      />
                    </div>
                  </React.Fragment>
                );
              }

              return (
                <Grid item xs={12}>
                  <input
                    ref={this.fileInput}
                    onChange={this.onFileSelectInputChange}
                    type="file"
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
  rightIcon: {
    marginLeft: unit,
  },
  chip: {
    marginTop: unit,
    marginBottom: unit,
  },
});

export default withStyles(styles)(Page);
