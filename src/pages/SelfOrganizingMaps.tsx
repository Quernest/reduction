import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Neuron } from "@seracio/kohonen/dist/types";
import round from "lodash/round";
import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import compose from "recompose/compose";
import {
  DatasetControls,
  DXTable,
  ErrorMessage,
  generateColumns,
  generateRows,
  HexagonalGrid,
  SOMControls,
  UploadControls
} from "src/components";
import {
  IDataset,
  IDatasetRequiredColumnsIndexes,
  IFilePreview,
  IHexagonalGridDimensions,
  ISOMOptions
} from "src/models";
import CalculateWorker from "worker-loader!src/components/SelfOrganizingMaps/calculate.worker";
import UploadWorker from "worker-loader!src/components/SelfOrganizingMaps/upload.worker";

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
    progress: {
      flexGrow: 1
    },
    divider: {
      marginBottom: spacing.unit * 2
    },
    maps: {
      marginTop: spacing.unit,
      marginBottom: spacing.unit
    },
    errors: {
      marginTop: spacing.unit * 2,
      marginBottom: spacing.unit * 2
    }
  });

interface IProps extends WithStyles<typeof styles> {}

interface IState {
  file: File | undefined;
  filePreview: IFilePreview;
  datasetRequiredColumnsIdxs: IDatasetRequiredColumnsIndexes;
  dataset: IDataset;
  uploading: boolean;
  uploaded: boolean;
  calculating: boolean;
  calculated: boolean;
  dimensions: IHexagonalGridDimensions;
  options: ISOMOptions;
  neurons: Neuron[];
  topographicError: number;
  quantizationError: number;
  positions: Array<[number, number]>;
  umatrix: number[];
  currentFactorIdx: number;
  error?: string;
}

class SelfOrganizingMapsPage extends Component<IProps, IState> {
  protected calculateWorker: Worker;
  protected uploadWorker: Worker;

  public readonly state: IState = {
    file: undefined,
    filePreview: {
      rows: [],
      columns: []
    },
    dataset: {
      observations: [],
      variables: [],
      factors: [],
      values: [],
      types: []
    },
    datasetRequiredColumnsIdxs: {
      observationsIdx: 0,
      typesIdx: undefined
    },
    uploading: false,
    uploaded: false,
    calculating: false,
    calculated: false,
    dimensions: {
      columns: 32,
      rows: 16
    },
    options: {
      maxStep: 1000,
      minLearningCoef: 0.3,
      maxLearningCoef: 0.7,
      minNeighborhood: 0.5,
      maxNeighborhood: 1
    },
    neurons: [],
    positions: [],
    umatrix: [],
    topographicError: 0,
    quantizationError: 0,
    currentFactorIdx: 0,
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
      this.onGetUploadWorkerMessage,
      false
    );
    this.calculateWorker = new CalculateWorker();
    this.calculateWorker.addEventListener(
      "message",
      this.onGetCalculateWorkerMessage,
      false
    );
  }

  protected destroyWorkers() {
    this.uploadWorker.terminate();
    this.uploadWorker.removeEventListener(
      "message",
      this.onGetUploadWorkerMessage,
      false
    );
    this.calculateWorker.terminate();
    this.calculateWorker.removeEventListener(
      "message",
      this.onGetCalculateWorkerMessage,
      false
    );
  }

  protected onControlsSubmit = (
    newDimensions: IHexagonalGridDimensions,
    newOptions: ISOMOptions
  ) => {
    const { filePreview, datasetRequiredColumnsIdxs } = this.state;

    this.setState({ dimensions: newDimensions, options: newOptions });
    this.startCalculating(
      datasetRequiredColumnsIdxs,
      filePreview,
      newDimensions,
      newOptions
    );
  };

  protected onGetCalculateWorkerMessage = ({
    data: {
      positions,
      umatrix,
      neurons,
      topographicError,
      quantizationError,
      dataset,
      error
    }
  }: MessageEvent) => {
    if (error) {
      this.setState({
        error,
        calculated: false,
        calculating: false,
        uploaded: false,
        uploading: false
      });
    } else {
      this.clearErrors();
      this.setState({
        dataset,
        positions,
        umatrix,
        neurons,
        topographicError,
        quantizationError,
        calculating: false,
        calculated: true
      });
    }
  };

  protected onGetUploadWorkerMessage = ({
    data: { error, filePreview }
  }: MessageEvent) => {
    if (error) {
      this.setState({
        error,
        uploaded: false,
        uploading: false
      });
    } else {
      this.clearErrors();
      this.setState({
        filePreview,
        uploaded: true,
        uploading: false
      });
    }
  };

  protected onChangeFile = (chosenFile?: File, error?: string): void => {
    if (error) {
      this.setState({
        error
      });
    } else {
      this.clearErrors();
      this.setState({
        file: chosenFile
      });
    }
  };

  protected onUploadFile = (): void => {
    const { file } = this.state;

    this.setState({ uploading: true });
    this.uploadWorker.postMessage(file);
  };

  protected onCancelFile = (): void => {
    this.clearErrors();
    this.setState({
      file: undefined
    });
  };

  private clearErrors = () => this.setState({ error: undefined });

  protected onChangeFactor = (factorIdx: number) => {
    this.setState({
      currentFactorIdx: factorIdx
    });
  };

  protected onChangeDatasetRequiredColumns = (
    newDatasetRequiredColumnsIdxs: IDatasetRequiredColumnsIndexes
  ) => {
    this.setState({
      datasetRequiredColumnsIdxs: newDatasetRequiredColumnsIdxs
    });
  };

  public startCalculating(
    datasetRequiredColumnsIdxs: IDatasetRequiredColumnsIndexes,
    filePreview: IFilePreview,
    dimensions: IHexagonalGridDimensions,
    options: ISOMOptions
  ) {
    this.setState({ calculated: false, calculating: true });
    this.calculateWorker.postMessage({
      datasetRequiredColumnsIdxs,
      filePreview,
      dimensions,
      options
    });
  }

  public render(): JSX.Element {
    const { classes } = this.props;
    const {
      uploaded,
      uploading,
      calculating,
      calculated,
      dimensions,
      options,
      neurons,
      umatrix,
      positions,
      dataset: { observations, types, factors },
      datasetRequiredColumnsIdxs,
      filePreview,
      currentFactorIdx,
      quantizationError,
      topographicError,
      error,
      file
    } = this.state;

    const previewColumns = generateColumns(filePreview.columns);
    const previewRows = generateRows(filePreview.rows, filePreview.columns);

    return (
      <div className={classes.root}>
        <div className={classes.wrap}>
          <Typography variant="h5" gutterBottom={true}>
            Self-Organizing Maps
          </Typography>
          <Divider className={classes.divider} />
          {uploaded && (
            <SOMControls
              options={options}
              dimensions={dimensions}
              onSubmit={this.onControlsSubmit}
              onChangeFactor={this.onChangeFactor}
              currentFactorIdx={currentFactorIdx}
              factors={factors}
              loading={calculating}
            />
          )}
          {uploaded && !calculated && !calculating && (
            <>
              <DatasetControls
                rows={filePreview.rows}
                columns={filePreview.columns}
                onChange={this.onChangeDatasetRequiredColumns}
                datasetRequiredColumnsIdxs={datasetRequiredColumnsIdxs}
              />
              <DXTable
                title="Dataset preview"
                rows={previewRows}
                columns={previewColumns}
              />
            </>
          )}
          {calculated && (
            <div className={classes.maps}>
              <div className={classes.errors}>
                <Grid container={true} spacing={8}>
                  <Grid item={true} xs="auto">
                    <Typography variant="body2">
                      Topographic error:{" "}
                      <span>{round(topographicError, 6)}</span>
                    </Typography>
                  </Grid>
                  <Grid item={true} xs="auto">
                    <Typography variant="body2">
                      Quantization error:{" "}
                      <span>{round(quantizationError, 6)}</span>
                    </Typography>
                  </Grid>
                </Grid>
              </div>
              <HexagonalGrid
                title="Heatmap"
                neurons={neurons}
                dimensions={dimensions}
                heatmap={true}
                currentFactorIdx={currentFactorIdx}
                positions={positions}
                observations={observations}
                factors={factors}
                types={types}
              />
              <HexagonalGrid
                title="U-matrix"
                neurons={neurons}
                dimensions={dimensions}
                umatrix={umatrix}
              />
            </div>
          )}
          {!uploaded && !calculated && (
            <>
              <Typography variant="body1" paragraph={true}>
                Process two-dimensional data arrays using self-organizing maps.
              </Typography>
              <Divider className={classes.divider} />
              <UploadControls
                file={file}
                onUpload={this.onUploadFile}
                onChange={this.onChangeFile}
                onCancel={this.onCancelFile}
                uploading={uploading}
              />
            </>
          )}
          {error && <ErrorMessage text={error} />}
        </div>
      </div>
    );
  }
}

export const SelfOrganizingMaps = compose<IProps, {}>(
  withRouter,
  withStyles(styles)
)(SelfOrganizingMapsPage);
