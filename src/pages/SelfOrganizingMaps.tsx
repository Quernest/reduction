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
  ErrorMessage,
  HexagonalGrid,
  SOMControls,
  UploadControls
} from "src/components";
import { IHexagonalGridDimensions, IParsedCSV, ISOMOptions } from "src/models";
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
  parsedFile: IParsedCSV;
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
  currentVariableIndex: number;
  error?: string;
}

class SelfOrganizingMapsPage extends Component<IProps, IState> {
  protected calculateWorker: Worker;
  protected uploadWorker: Worker;

  public readonly state: IState = {
    file: undefined,
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
    /**
     * uploaded and parsed dataset
     */
    parsedFile: {
      observations: [],
      variables: [],
      tailedVariables: [],
      values: []
    },
    /**
     * is equal index of variable in variables array
     */
    currentVariableIndex: 0,
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
    this.setState({ dimensions: newDimensions, options: newOptions });
    this.startCalculating(
      this.state.parsedFile.values,
      newDimensions,
      newOptions
    );
  };

  protected onGetCalculateWorkerMessage = ({
    data: { positions, umatrix, neurons, topographicError, quantizationError }
  }: MessageEvent) => {
    this.setState({
      positions,
      umatrix,
      neurons,
      topographicError,
      quantizationError,
      calculating: false,
      calculated: true
    });
  };

  protected onGetUploadWorkerMessage = ({
    data: { error, parsedFile }
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
        parsedFile,
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

  /**
   * change variable index handler
   */
  protected onChangeVariable = (variableIndex: number) => {
    this.setState({
      currentVariableIndex: variableIndex
    });
  };

  public startCalculating(
    data: number[][],
    dimensions: IHexagonalGridDimensions,
    options: ISOMOptions
  ) {
    this.setState({ calculated: false, calculating: true });
    this.calculateWorker.postMessage({ data, dimensions, options });
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
      parsedFile: { observations, tailedVariables },
      currentVariableIndex,
      quantizationError,
      topographicError,
      error,
      file
    } = this.state;

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
              onChangeVariable={this.onChangeVariable}
              currentVariableIndex={currentVariableIndex}
              variables={tailedVariables}
              loading={calculating}
            />
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
                currentVariableIndex={currentVariableIndex}
                positions={positions}
                observations={observations}
                variables={tailedVariables}
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
