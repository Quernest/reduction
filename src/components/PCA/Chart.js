// @flow
import React, { Component } from 'react';

// D3.js is a JavaScript library for manipulating documents based on data.
import {
  select, axisBottom, axisLeft, scaleLinear, max,
} from 'd3';

// Math.js is an extensive math library for JavaScript and Node.js.
import { abs } from 'mathjs';

type Props = {
  points: Array<{
    x: number,
    y: number,
    z?: number,
  }>,
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

export default class Chart extends Component<Props, State> {
  state = {
    margin: {
      top: 20,
      right: 20,
      bottom: 20,
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
    const { points } = this.props;

    this.selectSVGElement();
    this.drawAxes(points);
    this.drawPoints(points);
    this.drawVectors();
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

  drawAxes = (points) => {
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
      .text('X')
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
      .text('Y')
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
      .attr('r', 3)
      .attr('fill', 'red');
  };

  drawVectors = (vectors: Array<number[]>) => {
    // PC1
    this.svg
      .append('line')
      .style('stroke', 'red')
      .style('stroke-width', 2)
      .attr('x1', this.xScale(0))
      .attr('y1', this.yScale(0))
      .attr('x2', this.xScale(0.707))
      .attr('y2', this.yScale(0.707));
    // PC2
    this.svg
      .append('line')
      .style('stroke', 'blue')
      .style('stroke-width', 2)
      .attr('x1', this.xScale(0))
      .attr('y1', this.yScale(0))
      .attr('x2', this.xScale(-0.707))
      .attr('y2', this.yScale(0.707));
  };

  render() {
    return <svg id="chart" />;
  }
}
