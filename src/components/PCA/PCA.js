// @flow
// Principal component analysis page

// core
import React, { Component } from 'react';

// user interface elements
import {
  Grid, Button, Typography, withStyles, LinearProgress, Tooltip,
} from '@material-ui/core';

// Math.js is an extensive math library for JavaScript and Node.js.
import * as math from 'mathjs';

// lib computes the covariance between one or more numeric arrays.
import cov from 'compute-covariance';

// library for formatting and manipulating numbers.
import numeric from 'numeric';

// utilities
import { transformDatasetToPoints } from '../../helpers/utils';

import { Chart } from '.';

try {
  // import the numeric.js library into math.js
  math.import(numeric, { wrap: true, silent: true });
} catch (error) {
  console.warn(
    'Warning: To use numeric.js, the library must be installed first via "npm install numeric"',
  );
}

type Props = {
  classes: Object,
};

type State = {
  calculating: boolean,
  calculated: boolean,
  plotting: boolean,
  plotted: boolean,
};

class PCA extends Component<Props, State> {
  state = {
    calculating: false,
    calculated: false,
    plotting: false,
    plotted: false,
  };

  calculate = (): void => {
    this.setState({
      calculating: true,
      calculated: false,
    });

    // FIXME: IT'S A FAKE DATA
    const initialDataset: Array<number[]> = [[8, 18, 16, 20], [1.79, 4.0, 6.11, 8.42]];

    console.log('initial dataset', initialDataset);

    // 1) normalize the dataset
    const normalized: Array<number[]> = this.normalize(initialDataset);

    console.log('normalized dataset', normalized);

    // 2) compute matrix covariance
    const covariance: Array<number[]> = cov(normalized);

    console.log('matrix covariance', covariance);

    // 3-4) compute eigenvalues and eigenvectors
    const eigens: {
      // eigenvectors
      lambda: {
        x: Array<number[]>,
        y: Array<number[]>,
      },
      // eigenvalues
      E: {
        x: Array<number>,
        y: Array<number>,
      },
    } = this.eig(covariance);

    console.log('eigenvalues and eigenvectors', eigens);

    // 5) compute Linear Combinations

    // 6) analyse (calc percentage, etc...)
    const analyzes = this.analyse(eigens);

    console.log('analyzes of PCA', analyzes);

    // 7) plot graphics
    const points: Array<{ x: number, y: number }> = transformDatasetToPoints(normalized);

    // console.log('plotting graphs by points:', points);

    // this.plotGraphs(points);

    // FIXME: PASS POINTS TO PLOT FUNCTION
    setTimeout(() => {
      this.setState({
        points,
        calculating: false,
        calculated: true,
      });
    }, 300);
  };

  normalize = (dataset: Array<number[]>): Array<number[]> => dataset.map((data: Array<number>) => {
    const mean: number = math.mean(data);
    const variance: number = math.var(data);

    return data.map((value: number) => (value - mean) / math.sqrt(variance));
  });

  eig = (
    covariance: Array<number[]>,
  ): {
    // eigenvectors
    lambda: {
      x: Array<number[]>,
      y: Array<number[]>,
    },
    // eigenvalues
    E: {
      x: Array<number>,
      y: Array<number>,
    },
  } => {
    const matrix = math.matrix(covariance);

    if (!math.eig) {
      throw new Error('eigenvectors and eigenvalues is not supported in current version!');
    }

    return math.eval(`eig(${matrix})`);
  };

  analyse = (eigens: {
    // eigenvectors
    lambda: {
      x: Array<number[]>,
      y: Array<number[]>,
    },
    // eigenvalues
    E: {
      x: Array<number>,
      y: Array<number>,
    },
  }) => {
    console.log('analysing...', eigens);
  };

  download = () => console.log('downloading...');

  plot = () => {
    const { points } = this.state;

    this.setState({
      plotted: true,
    });

    // this.setState({
    //   plotting: true,
    //   plotted: false,
    // });

    // setTimeout(() => {
    //   this.setState({
    //     plotting: false,
    //     plotted: true,
    //   });
    // }, 300);
  };

  render() {
    const { classes } = this.props;
    const {
      calculated, calculating, plotted, plotting, points,
    } = this.state;

    return (
      <div className={classes.wrap}>
        <Grid className={classes.grid} container>
          <Grid item>
            <Typography className={classes.title} variant="h5">
              Principal component analysis
            </Typography>
            <Typography variant="subtitle1">
              Principal component analysis (PCA) is a statistical procedure that uses an orthogonal
              transformation to convert a set of observations of possibly correlated variables
              (entities each of which takes on various numerical values) into a set of values of
              linearly uncorrelated variables called principal components.
            </Typography>
            {calculated ? (
              <div>
                <Tooltip title="Plot the graphic">
                  <Button
                    className={classes.btnPlot}
                    color="primary"
                    variant="contained"
                    onClick={this.plot}
                    disabled={plotted || plotting}
                  >
                    Plot
                  </Button>
                </Tooltip>
                <Tooltip title="Download results in Microsoft Word .docx format">
                  <Button
                    className={classes.btnDownload}
                    color="primary"
                    variant="contained"
                    onClick={this.download}
                  >
                    Word
                  </Button>
                </Tooltip>
              </div>
            ) : (
              <Button
                className={classes.btnCalculate}
                color="primary"
                variant="contained"
                onClick={this.calculate}
                disabled={calculating}
              >
                Calculate
              </Button>
            )}
            {(calculating || plotting) && <LinearProgress className={classes.linearProgress} />}
            {plotted && <Chart points={points} />}
          </Grid>
        </Grid>
      </div>
    );
  }
}

const styles = theme => ({
  wrap: {
    padding: 20,
  },
  title: {
    marginBottom: 16,
  },
  grid: {
    [theme.breakpoints.up('lg')]: {
      width: 1170,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  linearProgress: {
    marginTop: 16,
    marginBottom: 16,
  },
  btnCalculate: {
    marginTop: 16,
    marginBottom: 16,
  },
  btnPlot: {
    marginTop: 16,
    marginBottom: 16,
  },
  btnDownload: {
    marginLeft: 16,
  },
});

export default withStyles(styles)(PCA);
