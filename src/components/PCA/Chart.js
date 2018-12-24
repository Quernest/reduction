// @flow
import React, { Component } from 'react';

// D3.js is a JavaScript library for manipulating documents based on data.
import {
  select, axisBottom, axisLeft, scaleLinear, max,
} from 'd3';

// Math.js is an extensive math library for JavaScript and Node.js.
import { abs } from 'mathjs';
import { round } from 'lodash';

type Props = {
  points: Array<{
    x: number,
    y: number,
    z?: number,
  }>,
  vectors: Array<number[]>,
  names: Array<string>,
  analysis: Array<number>,
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

class Chart extends Component<Props, State> {
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
    const { points, vectors, names, analysis } = this.props;

    this.selectSVGElement();
    this.drawAxes(points, names, analysis);
    this.drawPoints(points);
    this.drawVectors(vectors);
  }

  selectSVGElement = () => {
    const { fullWidth, fullHeight, margin } = this.state;

    this.svg = select('#chart')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${fullWidth} ${fullHeight}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  };

  drawAxes = (points, axes, analysis) => {
    const { width, height, margin } = this.state;

    const x = scaleLinear()
      .rangeRound([0, width])
      .domain([-max(points, d => abs(d.x)), max(points, d => abs(d.x))]);

    const xAxis = axisBottom(x);

    const y = scaleLinear()
      .rangeRound([0, height])
      .domain([max(points, d => abs(d.y)), -max(points, d => abs(d.y))]);

    const yAxis = axisLeft(y);

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
    const opposite: number = (value: number): number => -value;

    this.svg
      .append('line')
      .style('stroke', '#000')
      .style('stroke-width', 1.5)
      .attr('x1', this.xScale(0))
      .attr('y1', this.yScale(0))
      .attr('x2', this.xScale(round(opposite(vectors[0][0]), 3)))
      .attr('y2', this.yScale(round(opposite(vectors[0][1]), 3)))
      .attr('marker-end', 'url(#arrow)');
    this.svg
      .append('line')
      .style('stroke', '#000')
      .style('stroke-width', 1.5)
      .attr('x1', this.xScale(0))
      .attr('y1', this.yScale(0))
      .attr('x2', this.xScale(round(opposite(vectors[1][0]), 3)))
      .attr('y2', this.yScale(round(opposite(vectors[1][1]), 3)))
      .attr('marker-end', 'url(#arrow)');
  };

  render() {
    return (
      <svg id="chart">
        <defs>
          <marker
            id="arrow"
            markerUnits="strokeWidth"
            markerWidth="12"
            markerHeight="12"
            viewBox="0 0 12 12"
            refX="6"
            refY="6"
            orient="auto"
          >
            <path d="M2,2 L10,6 L2,10 L6,6 L2,2" style={{ fill: '#000' }} />
          </marker>
        </defs>
      </svg>
    );
  }
}

export default Chart;
