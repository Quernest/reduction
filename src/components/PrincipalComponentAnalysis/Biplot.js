// @flow
import React from 'react';
import * as d3 from 'd3';
import * as math from 'mathjs';
import size from 'lodash/size';
import forEach from 'lodash/forEach';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { opposite } from '../../utils/numbers';

type Props = {
  points: Array<{
    x: number,
    y: number,
    z?: number,
  }>,
  vectors: Array<number[]>,
  names: Array<string>,
  analysis: Array<number>,
  classes: Object,
};

type State = {
  fullWidth: number,
  fullHeight: number,
  width: number,
  height: number,
  margin: {
    top: number,
    right: number,
    bottom: number,
    left: number,
  },
};

class Biplot extends React.Component<Props, State> {
  state = {
    margin: {
      top: 20,
      right: 20,
      bottom: 35,
      left: 35,
    },
    fullWidth: 825,
    fullHeight: 625,
    get width() {
      return this.fullWidth - this.margin.left - this.margin.right;
    },
    get height() {
      return this.fullHeight - this.margin.top - this.margin.bottom;
    },
  };

  componentDidMount() {
    const {
      points, vectors, names, analysis,
    } = this.props;

    // 2D only
    if (size(names) > 2) {
      return;
    }

    this.selectSVGElement();
    this.drawAxes(points, names, analysis);
    this.drawPoints(points);
    this.drawVectors(vectors);
  }

  selectSVGElement = () => {
    const { fullWidth, fullHeight, margin } = this.state;

    this.svg = d3
      .select('#biplot')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${fullWidth} ${fullHeight}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  };

  drawAxes = (points, axes, analysis) => {
    const { width, height, margin } = this.state;

    const x = d3
      .scaleLinear()
      .rangeRound([0, width])
      .domain([
        -d3.max(points, d => math.abs(d.x)),
        d3.max(points, d => math.abs(d.x)),
      ]);

    const xAxis = d3.axisBottom(x);

    const y = d3
      .scaleLinear()
      .rangeRound([0, height])
      .domain([
        d3.max(points, d => math.abs(d.y)),
        -d3.max(points, d => math.abs(d.y)),
      ]);

    const yAxis = d3.axisLeft(y);

    this.svg
      .append('g')
      .attr('transform', `translate(0, ${height / 2})`)
      .call(xAxis);

    this.svg
      .append('text')
      .text(`${axes[0]} (${analysis[0]}%)`)
      .attr('x', 0 - height / 2)
      .attr('y', 0 - margin.left)
      .attr('dy', '1em')
      .style('font-size', 12)
      .style('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)');

    this.svg
      .append('g')
      .attr('transform', `translate(${width / 2}, 0)`)
      .call(yAxis);

    this.svg
      .append('text')
      .text(`${axes[1]} (${analysis[1]}%)`)
      .attr('x', width / 2)
      .attr('y', height + margin.bottom)
      .attr('dy', '-1em')
      .style('font-size', 12)
      .style('text-anchor', 'middle');

    this.svg
      .selectAll('.tick')
      .filter(d => d === 0)
      .remove();

    this.xScale = x;
    this.yScale = y;
  };

  drawPoints = (points) => {
    this.svg
      .selectAll('circle')
      .data(points)
      .enter()
      .append('circle')
      .attr('cx', d => this.xScale(d.x))
      .attr('cy', d => this.yScale(d.y))
      .attr('r', 2)
      .attr('fill', 'red');
  };

  drawVectors = (vectors: Array<number[]>) => {
    const defs = this.svg.append('defs');
    const marker = defs
      .append('marker')
      .attr('id', 'arrow')
      .attr('markerUnits', 'strokeWidth')
      .attr('markerWidth', 12)
      .attr('markerHeight', 12)
      .attr('viewBox', '0 0 12 12')
      .attr('refX', 6)
      .attr('refY', 6)
      .attr('orient', 'auto');
    marker
      .append('path')
      .attr('d', 'M2,2 L10,6 L2,10 L6,6 L2,2')
      .style({
        fill: '#000',
      });

    this.svg
      .append('line')
      .style('stroke', '#000')
      .style('stroke-width', 1.5)
      .attr('x1', this.xScale(0))
      .attr('y1', this.yScale(0))
      .attr('x2', this.xScale(vectors[0][0]))
      .attr('y2', this.yScale(vectors[1][0]))
      .attr('marker-end', 'url(#arrow)');
    this.svg
      .append('line')
      .style('stroke', '#000')
      .style('stroke-width', 1.5)
      .attr('x1', this.xScale(0))
      .attr('y1', this.yScale(0))
      .attr('x2', this.xScale(vectors[0][1]))
      .attr('y2', this.yScale(vectors[1][1]))
      .attr('marker-end', 'url(#arrow)');
  };

  render() {
    const { names, classes } = this.props;

    // 2D only
    if (size(names) > 2) {
      return null;
    }

    return (
      <div className={classes.root}>
        <Typography variant="h6" paragraph>
          Biplot
        </Typography>
        <svg id="biplot" />
      </div>
    );
  }
}

const styles = {
  root: {
    width: '100%',
    height: 'auto',
  },
};

export default withStyles(styles)(Biplot);