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
import { HexagonalGrid, SOMControls } from "src/components";
import { gspData } from "src/data/gsp";
import { IHexagonalGridDimensions } from "src/models/chart.model";
import { IOptions, ISOMData } from "src/models/som.model";
import CalculateWorker from "worker-loader!src/components/SelfOrganizingMaps/calculate.worker";

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
  uploading: boolean;
  uploaded: boolean;
  calculating: boolean;
  calculated: boolean;
  dimensions: IHexagonalGridDimensions;
  options: IOptions;
  neurons: Neuron[];
  topographicError: number;
  quantizationError: number;
  data: ISOMData;
  positions: Array<[number, number]>;
  umatrix: number[];
  currentVariableIndex: number;
}

class SelfOrganizingMapsPage extends Component<IProps, IState> {
  protected calculateWorker: Worker;

  public readonly state: IState = {
    uploading: false,
    uploaded: false,
    calculating: false,
    calculated: false,
    dimensions: {
      columns: 16,
      rows: 8
    },
    options: {
      maxStep: 100,
      minLearningCoef: 0.3,
      maxLearningCoef: 0.7,
      minNeighborhood: 0.4,
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
    data: gspData,
    /**
     * is equal index of variable in variables array
     */
    currentVariableIndex: 0
  };

  public componentDidMount() {
    this.initWorkers();
  }

  public componentWillUnmount() {
    this.destroyWorkers();
  }

  protected initWorkers() {
    this.calculateWorker = new CalculateWorker();
    this.calculateWorker.addEventListener(
      "message",
      this.onGetCalculateWorkerMessage,
      false
    );
  }

  protected destroyWorkers() {
    this.calculateWorker.terminate();
    this.calculateWorker.removeEventListener(
      "message",
      this.onGetCalculateWorkerMessage,
      false
    );
  }

  protected onControlsSubmit = (
    newDimensions: IHexagonalGridDimensions,
    newOptions: IOptions
  ) => {
    this.setState({ dimensions: newDimensions, options: newOptions });
    this.startCalculating(this.state.data.values, newDimensions, newOptions);
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
    options: IOptions
  ) {
    this.setState({ calculated: false, calculating: true });
    this.calculateWorker.postMessage({ data, dimensions, options });
  }

  public render(): JSX.Element {
    const { classes } = this.props;
    const {
      calculating,
      calculated,
      dimensions,
      options,
      neurons,
      umatrix,
      positions,
      data: { observations, variables },
      currentVariableIndex,
      quantizationError,
      topographicError
    } = this.state;

    return (
      <div className={classes.root}>
        <div className={classes.wrap}>
          <Typography variant="h5" paragraph={true}>
            Self-Organizing Maps
          </Typography>
          <Divider className={classes.divider} />
          <SOMControls
            options={options}
            dimensions={dimensions}
            onSubmit={this.onControlsSubmit}
            onChangeVariable={this.onChangeVariable}
            currentVariableIndex={currentVariableIndex}
            variables={variables}
            loading={calculating}
          />
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
                variables={variables}
              />
              <HexagonalGrid
                title="U-matrix"
                neurons={neurons}
                dimensions={dimensions}
                umatrix={umatrix}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export const SelfOrganizingMaps = compose<IProps, {}>(
  withRouter,
  withStyles(styles)
)(SelfOrganizingMapsPage);
