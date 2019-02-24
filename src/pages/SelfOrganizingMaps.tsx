import Divider from "@material-ui/core/Divider";
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Neuron } from "@seracio/kohonen/dist/types";
import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import compose from "recompose/compose";
import { CanvasHexagonalGrid, SOMControls } from "src/components";
import { IHexagonalGridDimensions } from "src/models/chart.model";
import { IOptions } from "src/models/som.model";
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
  data: number[][];
  positions: Array<[number, number]>;
  umatrix: number[];
}

class SelfOrganizingMapsPage extends Component<IProps, IState> {
  protected calculateWorker: Worker;

  public readonly state: IState = {
    uploading: false,
    uploaded: false,
    calculating: false,
    calculated: false,
    dimensions: {
      columns: 25,
      rows: 12,
      hexagonSize: 50
    },
    options: {
      maxStep: 500,
      minLearningCoef: 0.5,
      maxLearningCoef: 1,
      minNeighborhood: 0.4,
      maxNeighborhood: 1
    },
    neurons: [],
    positions: [],
    umatrix: [],
    data: [
      [255, 255, 255],
      [0, 0, 255],
      [0, 255, 0],
      [0, 255, 255],
      [255, 0, 0],
      [255, 0, 255],
      [255, 255, 0],
      [255, 255, 255]
    ]
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
    this.startCalculating(this.state.data, newDimensions, newOptions);
  };

  protected onGetCalculateWorkerMessage = ({
    data: { positions, umatrix, neurons }
  }: MessageEvent) => {
    this.setState({
      positions,
      umatrix,
      neurons,
      calculating: false,
      calculated: true
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
      positions
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
            loading={calculating}
          />
          {calculated && (
            <div className={classes.maps}>
              <CanvasHexagonalGrid
                title="Positions"
                neurons={neurons}
                dimensions={dimensions}
                positions={positions}
              />
              <CanvasHexagonalGrid
                title="Heatmap"
                neurons={neurons}
                dimensions={dimensions}
                heatmap={true}
              />
              <CanvasHexagonalGrid
                title="U-matrix"
                neurons={neurons}
                dimensions={dimensions}
                umatrix={umatrix}
              />
              {/* <HexagonalGrid
                title="Positions"
                neurons={neurons}
                dimensions={dimensions}
                positions={positions}
              />
              <HexagonalGrid
                title="Heatmap"
                neurons={neurons}
                dimensions={dimensions}
                heatmap={true}
              />
              <HexagonalGrid
                title="U-matrix (Neighbour Distance)"
                neurons={neurons}
                dimensions={dimensions}
                umatrix={umatrix}
              /> */}
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
