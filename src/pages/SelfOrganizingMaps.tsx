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
import { HexagonalGrid, SOMControls } from "src/components";
import { IHexagonalGridDimensions } from "src/models/chart.model";
import { ITrainingConfig } from "src/models/som.model";
import CalculateWorker from "worker-loader!src/components/SelfOrganizingMaps/calculate.worker";
import GridWorker from "worker-loader!src/components/SelfOrganizingMaps/grid.worker";

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
  plotted: boolean;
  plotting: boolean;
  withTraining: boolean;
  dimensions: IHexagonalGridDimensions;
  trainingConfig: ITrainingConfig;
  neurons: Neuron[];
  data: number[][];
  positions: Array<[number, number]>;
  umatrix: number[];
}

class SelfOrganizingMapsPage extends Component<IProps, IState> {
  protected calculateWorker: Worker;
  protected gridWorker: Worker;

  public readonly state: IState = {
    uploading: false,
    uploaded: false,
    calculating: false,
    calculated: false,
    plotted: false,
    plotting: false,
    withTraining: false,
    dimensions: {
      columns: 50,
      rows: 24,
      hexagonSize: 25
    },
    trainingConfig: {
      maxStep: 1000,
      minLearningCoef: 0.5,
      maxLearningCoef: 1,
      minNeighborhood: 0.4,
      maxNeighborhood: 1
    },
    neurons: [],
    positions: [],
    umatrix: [],
    data: [
      [0, 0, 0],
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

  private onStartCalculations = () => {
    const { withTraining, trainingConfig, neurons, data } = this.state;

    if (withTraining) {
      this.setState({ calculating: true });
      this.calculateWorker.postMessage({ neurons, data, ...trainingConfig });
    }
  };

  private onGetGridWorkerMessage = (event: MessageEvent) => {
    const { neurons, dimensions, trainingConfig } = event.data;

    this.setState(
      {
        umatrix: [],
        positions: [],
        neurons,
        dimensions,
        trainingConfig,
        plotted: true,
        plotting: false
      },
      this.onStartCalculations
    );
  };

  private onGetCalculateWorkerMessage = (event: MessageEvent) => {
    const { positions, umatrix, neurons } = event.data;

    this.setState({
      positions,
      umatrix,
      neurons,
      calculated: true,
      calculating: false
    });

    // const { maxStep } = this.state.trainingConfig;
    // const { neurons} = event.data;

    // this.setState({
    //   neurons
    // });

    // if (step === maxStep) {
    //   const { positions, umatrix } = event.data;

    //   this.setState({
    //     calculated: true,
    //     calculating: false,
    //     positions,
    //     umatrix
    //   });
    // }
  };

  private initWorkers() {
    this.gridWorker = new GridWorker();
    this.gridWorker.addEventListener(
      "message",
      this.onGetGridWorkerMessage,
      false
    );

    this.calculateWorker = new CalculateWorker();
    this.calculateWorker.addEventListener(
      "message",
      this.onGetCalculateWorkerMessage,
      false
    );
  }

  private destroyWorkers() {
    this.gridWorker.terminate();
    this.gridWorker.removeEventListener(
      "message",
      this.onGetGridWorkerMessage,
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
    newTrainingConfig: ITrainingConfig
  ) => {
    this.setState({
      calculated: false,
      plotting: true
    });

    this.gridWorker.postMessage({
      dimensions: newDimensions,
      trainingConfig: newTrainingConfig
    });
  };

  protected onSwitchTraining = (checked: boolean) => {
    this.setState({
      withTraining: checked
    });
  };

  public render(): JSX.Element {
    const { classes } = this.props;
    const {
      calculating,
      plotting,
      plotted,
      dimensions,
      trainingConfig,
      withTraining,
      neurons,
      umatrix
    } = this.state;

    return (
      <div className={classes.root}>
        <div className={classes.wrap}>
          <Typography variant="h5" paragraph={true}>
            Self-Organizing Maps
          </Typography>
          <Divider className={classes.divider} />
          <SOMControls
            trainingConfig={trainingConfig}
            dimensions={dimensions}
            onSubmit={this.onControlsSubmit}
            onSwitchTraining={this.onSwitchTraining}
            withTraining={withTraining}
            loading={calculating || plotting}
          />
          {plotted && (
            <div className={classes.maps}>
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
