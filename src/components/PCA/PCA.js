// @flow
// Principal component analysis page

// core
import React, { Component } from 'react';

// user interface elements
import {
  Grid, Button, Typography, withStyles, LinearProgress, Tooltip,
} from '@material-ui/core';

// D3.js is a JavaScript library for manipulating documents based on data.
import * as d3 from 'd3';

// Math.js is an extensive math library for JavaScript and Node.js.
import * as math from 'mathjs';

// lib computes the covariance between one or more numeric arrays.
import cov from 'compute-covariance';

// library for formatting and manipulating numbers.
import numeric from 'numeric';

// utilities
import { transformDatasetToPoints } from '../../helpers/utils';

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
      plotting: true,
      plotted: false,
    });

    setTimeout(() => {
      this.plotGraphs(points);
      this.setState({
        plotting: false,
        plotted: true,
      });
    }, 300);
  };

  plotGraphs = (points: Array<{ x: number, y: number }>): void => {
    if (!points || points.length === 0) {
      throw new Error('There are no points to plot');
    }

    // remove existed svgs
    d3.select('#chart svg').remove();

    const margin: {
      top: number,
      right: number,
      bottom: number,
      left: number,
    } = {
      top: 20,
      right: 30,
      bottom: 20,
      left: 30,
    };

    const width: number = 800 - margin.left - margin.right;

    const height: number = 600 - margin.top - margin.bottom;

    // create svg element
    const svg = d3
      .select('#chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g') // add group to leave margin for axis
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const x = d3
      .scaleLinear()
      .rangeRound([0, width])
      .domain([-d3.max(points, d => math.abs(d.x)), d3.max(points, d => math.abs(d.x))]);

    const y = d3
      .scaleLinear()
      .rangeRound([0, height])
      .domain([d3.max(points, d => math.abs(d.y)), -d3.max(points, d => math.abs(d.y))]);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    svg
      .append('g')
      .attr('transform', `translate(${width / 2}, 0)`)
      .call(yAxis);

    svg
      .append('g')
      .attr('transform', `translate(0, ${height / 2})`)
      .call(xAxis);

    svg
      .append('text')
      .text('X')
      .attr('x', 0 - height / 2)
      .attr('y', 0 - margin.left)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)');

    svg
      .append('text')
      .text('Y')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom)
      .style('text-anchor', 'middle');

    svg
      .selectAll('.tick')
      .filter(d => d === 0)
      .remove();

    svg
      .selectAll('circle')
      .data(points)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.x))
      .attr('cy', d => y(d.y))
      .attr('r', 3)
      .attr('fill', 'red');

    // WARN: it's just template for svg line
    svg
      .append('line')
      .style('stroke', 'blue')
      .style('stroke-width', 2)
      .attr('x1', x(0))
      .attr('y1', y(0))
      .attr('x2', x(1))
      .attr('y2', y(1));
  };

  render() {
    const { classes } = this.props;
    const {
      calculated,
      calculating,
      plotted,
      plotting,
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
            <div id="chart" className={classes.chart} />
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
  chart: {
    width: '100%',
  },
});

export default withStyles(styles)(PCA);
