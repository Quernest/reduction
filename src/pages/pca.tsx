import Divider from "@material-ui/core/Divider";
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React from "react";
import debounce from "lodash/debounce";
import { RouteComponentProps, withRouter } from "react-router";
import compose from "recompose/compose";
import {
  ErrorMessage,
  UploadControls,
  VisualizeControls,
  Calculations,
  CalculateControls,
  Charts
} from "../components";
import {
  IDataset,
  IDatasetRequiredColumnsIndexes,
  IParsedFile
} from "../models";
import PCAWorker from "worker-loader!../workers/pca.worker";
import UploadWorker from "worker-loader!../workers/upload.worker";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      padding: theme.spacing(2),
      [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(3)
      }
    },
    wrap: {
      width: "100%",
      maxWidth: theme.breakpoints.values.lg,
      marginLeft: "auto",
      marginRight: "auto"
    },
    divider: {
      marginBottom: theme.spacing(3)
    }
  });

interface IPCAPageProps
  extends WithStyles<typeof styles>,
  RouteComponentProps { }

interface IPCAPageState {
  file?: File;
  parsedFile: IParsedFile;
  dataset: IDataset;
  datasetRequiredColumnsIdxs: IDatasetRequiredColumnsIndexes;
  selectedComponents: {
    x: number;
    y: number;
  };
  explainedVariance: number[];
  cumulativeVariance: number[];
  adjustedDataset: number[][];
  loadings: number[][];
  predictions: number[][];
  eigenvalues: number[];
  components: string[];
  importantComponents: string[];
  uploading: boolean;
  uploaded: boolean;
  calculating: boolean;
  calculated: boolean;
  error?: string;
}

class PCAPageBase extends React.Component<IPCAPageProps, IPCAPageState> {
  protected uploadWorker: Worker;
  protected pcaWorker: Worker;

  public readonly state: IPCAPageState = {
    file: undefined,
    parsedFile: {
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
    selectedComponents: {
      x: 0,
      y: 1
    },
    explainedVariance: [],
    cumulativeVariance: [],
    loadings: [],
    predictions: [],
    adjustedDataset: [],
    components: [],
    importantComponents: [],
    eigenvalues: [],
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
    this.pcaWorker = new PCAWorker();
    this.pcaWorker.addEventListener("message", this.onPCAWorkerMsg, false);
  }

  protected destroyWorkers() {
    this.uploadWorker.terminate();
    this.uploadWorker.removeEventListener(
      "message",
      this.onUploadWorkerMsg,
      false
    );
    this.pcaWorker.terminate();
    this.pcaWorker.removeEventListener("message", this.onPCAWorkerMsg, false);
  }

  protected onUploadWorkerMsg = debounce(
    ({ data: { error, parsedFile } }: MessageEvent) => {
      if (error) {
        this.setState({
          error,
          uploaded: false,
          uploading: false
        });
      } else {
        this.setState({
          error,
          parsedFile,
          uploaded: true,
          uploading: false
        });
      }
    },
    700
  );

  protected onPCAWorkerMsg = debounce(
    ({
      data: {
        error,
        dataset,
        explainedVariance,
        cumulativeVariance,
        adjustedDataset,
        loadings,
        predictions,
        eigenvalues,
        components,
        importantComponents
      }
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
          explainedVariance,
          cumulativeVariance,
          adjustedDataset,
          loadings,
          predictions,
          eigenvalues,
          components,
          importantComponents,
          calculated: true,
          calculating: false
        });
      }
    },
    700
  );

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
    const { datasetRequiredColumnsIdxs, parsedFile } = this.state;

    this.setState({
      calculated: false,
      calculating: true
    });

    this.pcaWorker.postMessage({
      datasetRequiredColumnsIdxs,
      parsedFile
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
      parsedFile,
      dataset,
      adjustedDataset,
      datasetRequiredColumnsIdxs,
      selectedComponents,
      explainedVariance,
      cumulativeVariance,
      importantComponents,
      components,
      eigenvalues,
      predictions,
      loadings,
      uploading,
      uploaded,
      calculating,
      calculated,
      error
    } = this.state;

    return (
      <div className={classes.root}>
        <div className={classes.wrap}>
          <Typography variant="h1" gutterBottom={true}>
            Principal Component Analysis
          </Typography>
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
              parsedFile={parsedFile}
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
                components={components}
                onChange={this.onChangeSelectedComponents}
                selectedComponents={selectedComponents}
              />
              <Charts
                adjustedDataset={adjustedDataset}
                factors={dataset.factors}
                components={components}
                loadings={loadings}
                eigenvalues={eigenvalues}
                selectedComponents={selectedComponents}
              />
              <Calculations
                dataset={dataset}
                loadings={loadings}
                predictions={predictions}
                eigenvalues={eigenvalues}
                explainedVariance={explainedVariance}
                cumulativeVariance={cumulativeVariance}
                importantComponents={importantComponents}
                components={components}
                datasetRequiredColumnsIdxs={datasetRequiredColumnsIdxs}
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
