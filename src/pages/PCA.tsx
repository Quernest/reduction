import Divider from "@material-ui/core/Divider";
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import compose from "recompose/compose";
import {
  CalculateControls,
  Calculations,
  Charts,
  ErrorMessage,
  UploadControls,
  VisualizeControls
} from "src/components";
import {
  IDataset,
  IDatasetRequiredColumnsIndexes,
  IFilePreview,
  IPCACalculations
} from "src/models";
import CalculateWorker from "worker-loader!src/workers/PCA/calculate.worker";
import UploadWorker from "worker-loader!src/workers/PCA/upload.worker";

const styles = ({ spacing, breakpoints }: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      padding: spacing.unit * 2,
      [breakpoints.up("sm")]: {
        padding: spacing.unit * 3
      }
    },
    wrap: {
      width: "100%",
      maxWidth: breakpoints.values.lg,
      marginLeft: "auto",
      marginRight: "auto"
    },
    divider: {
      marginBottom: spacing.unit * 3
    }
  });

interface IPCAPageProps extends WithStyles<typeof styles>, RouteComponentProps {}

interface IPCAPageState {
  file?: File;
  filePreview: IFilePreview;
  dataset: IDataset;
  datasetRequiredColumnsIdxs: IDatasetRequiredColumnsIndexes;
  calculations: IPCACalculations;
  selectedComponents: {
    x: number;
    y: number;
  };
  uploading: boolean;
  uploaded: boolean;
  calculating: boolean;
  calculated: boolean;
  error?: string;
}

class PCAPageBase extends React.Component<IPCAPageProps, IPCAPageState> {
  protected uploadWorker: Worker;
  protected calculateWorker: Worker;

  public readonly state: IPCAPageState = {
    file: undefined,
    filePreview: {
      rows: [],
      columns: []
    },
    dataset: {
      variables: [],
      factors: [],
      values: [],
      types: [],
      observations: []
    },
    datasetRequiredColumnsIdxs: {
      observationsIdx: 0,
      typesIdx: undefined
    },
    calculations: {
      originalDataset: [],
      adjustedDataset: [],
      covariance: [],
      eigens: {
        E: {
          y: [],
          x: []
        },
        lambda: {
          x: [],
          y: []
        }
      },
      linearCombinations: [],
      analysis: {
        proportion: [],
        cumulative: [],
        differences: [],
        totalProportion: 0,
        importantComponents: [],
        importantComponentsVariance: 0,
        components: []
      }
    },
    selectedComponents: {
      x: 0,
      y: 1
    },
    uploading: false,
    uploaded: false,
    calculating: false,
    calculated: false,
    error: undefined
  };

  public componentDidMount() {
    this.initWorkers();
  }

  public componentWillUnmount() {
    this.destroyWorkers();
  }

  protected initWorkers() {
    this.uploadWorker = new UploadWorker();
    this.uploadWorker.addEventListener(
      "message",
      this.onUploadWorkerMsg,
      false
    );
    this.calculateWorker = new CalculateWorker();
    this.calculateWorker.addEventListener(
      "message",
      this.onCalculateWorkerMsg,
      false
    );
  }

  protected destroyWorkers() {
    this.uploadWorker.terminate();
    this.uploadWorker.removeEventListener(
      "message",
      this.onUploadWorkerMsg,
      false
    );
    this.calculateWorker.terminate();
    this.calculateWorker.removeEventListener(
      "message",
      this.onCalculateWorkerMsg,
      false
    );
  }

  protected onUploadWorkerMsg = ({
    data: { error, filePreview }
  }: MessageEvent) => {
    if (error) {
      this.setState({
        error,
        uploaded: false,
        uploading: false
      });
    } else {
      this.setState({
        error,
        filePreview,
        uploaded: true,
        uploading: false
      });
    }
  };

  protected onCalculateWorkerMsg = ({
    data: { error, dataset, calculations }
  }: MessageEvent) => {
    if (error) {
      this.setState({
        error,
        uploaded: false,
        uploading: false,
        calculated: false,
        calculating: false
      });
    } else {
      this.setState({
        error,
        dataset,
        calculations,
        calculated: true,
        calculating: false
      });
    }
  };

  protected onFileChange = (file?: File, error?: string) => {
    this.setState({
      uploaded: false,
      error,
      file
    });
  };

  protected onFileUpload = () => {
    const { file } = this.state;

    this.setState({
      error: undefined,
      uploaded: false,
      uploading: true
    });

    this.uploadWorker.postMessage(file);
  };

  protected onFileCancel = () => {
    this.setState({
      error: undefined,
      file: undefined
    });
  };

  protected onCalculate = () => {
    const { datasetRequiredColumnsIdxs, filePreview } = this.state;

    this.setState({
      calculated: false,
      calculating: true
    });

    this.calculateWorker.postMessage({
      datasetRequiredColumnsIdxs,
      filePreview
    });
  };

  protected onChangeSelectedComponents = (selectedComponents: {
    x: number;
    y: number;
  }) => {
    this.setState({
      selectedComponents
    });
  };

  protected onChangeDatasetRequiredColumns = (
    datasetRequiredColumnsIdxs: IDatasetRequiredColumnsIndexes
  ) => {
    this.setState({
      datasetRequiredColumnsIdxs
    });
  };

  public render() {
    const { classes } = this.props;
    const {
      file,
      filePreview,
      dataset,
      datasetRequiredColumnsIdxs,
      calculations,
      selectedComponents,
      uploading,
      uploaded,
      calculating,
      calculated,
      error
    } = this.state;

    return (
      <div className={classes.root}>
        <div className={classes.wrap}>
          <Typography variant="h1">Principal Component Analysis</Typography>
          {!uploaded && !calculated && (
            <>
              <Typography variant="body1" paragraph={true}>
                Process two-dimensional data arrays using principal component
                analysis.
              </Typography>
              <Divider className={classes.divider} />
              <UploadControls
                file={file}
                onUpload={this.onFileUpload}
                onChange={this.onFileChange}
                onCancel={this.onFileCancel}
                uploading={uploading}
              />
            </>
          )}
          {uploaded && !calculated && (
            <CalculateControls
              datasetRequiredColumnsIdxs={datasetRequiredColumnsIdxs}
              filePreview={filePreview}
              onCalculate={this.onCalculate}
              onChangeDatasetRequiredColumns={
                this.onChangeDatasetRequiredColumns
              }
              calculating={calculating}
            />
          )}
          {calculated && (
            <>
              <VisualizeControls
                calculations={calculations}
                onChange={this.onChangeSelectedComponents}
                selectedComponents={selectedComponents}
              />
              <Charts
                dataset={dataset}
                calculations={calculations}
                selectedComponents={selectedComponents}
              />
              <Calculations
                datasetRequiredColumnsIdxs={datasetRequiredColumnsIdxs}
                dataset={dataset}
                calculations={calculations}
              />
            </>
          )}
          {error && <ErrorMessage text={error} />}
        </div>
      </div>
    );
  }
}

export const PCAPage = compose<IPCAPageProps, any>(
  withRouter,
  withStyles(styles)
)(PCAPageBase);
