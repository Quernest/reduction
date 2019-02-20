import Divider from "@material-ui/core/Divider";
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Neuron } from "@seracio/kohonen/dist/types";
import debounce from "lodash/debounce";
import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import compose from "recompose/compose";
import { SOMControls, UMatrixGrid } from "src/components";
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

  private debounceTime: number = 500;

  public readonly state: IState = {
    uploading: false,
    uploaded: false,
    calculating: false,
    calculated: false,
    plotted: false,
    plotting: false,
    withTraining: false,
    dimensions: {
      columns: 25,
      rows: 12,
      hexagonSize: 50
    },
    trainingConfig: {
      maxStep: 1000,
      minLearningCoef: 0.1,
      maxLearningCoef: 0.4,
      minNeighborhood: 0.3,
      maxNeighborhood: 1
    },
    neurons: [],
    positions: [],
    umatrix: [],
    data: [[0, 0, 0], [10, 25, 16], [0, 0, 0]]
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

  private onGetGridWorkerMessage = debounce((event: MessageEvent) => {
    const { neurons, dimensions, trainingConfig } = event.data;

    this.setState(
      {
        neurons,
        dimensions,
        trainingConfig,
        plotted: true,
        plotting: false
      },
      this.onStartCalculations
    );
  }, this.debounceTime);

  private onGetCalculateWorkerMessage = debounce((event: MessageEvent) => {
    const { positions, neurons, umatrix } = event.data;

    this.setState({
      positions,
      neurons,
      umatrix,
      calculated: true,
      calculating: false
    });

    // const { maxStep } = this.state.trainingConfig;
    // const { step } = event.data;

    // if (step === maxStep) {
    //   this.setState({ calculated: true, calculating: false });
    // }
  }, this.debounceTime);

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
              <UMatrixGrid
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
