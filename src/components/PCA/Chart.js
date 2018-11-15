// @flow
import React, { Component } from 'react';

// D3.js is a JavaScript library for manipulating documents based on data.
import {
  select, axisBottom, axisLeft, scaleLinear, max,
} from 'd3';

// Math.js is an extensive math library for JavaScript and Node.js.
import { abs } from 'mathjs';

const margin: {
  top: number,
  right: number,
  bottom: number,
  left: number,
} = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 35,
};

const fullWidth: number = 800;
const fullHeight: number = 600;
const width: number = fullWidth - margin.left - margin.right;
const height: number = fullHeight - margin.top - margin.bottom;

type Props = {
  points: Array<{
    x: number,
    y: number,
    z?: number,
  }>,
};

export default class Chart extends Component<Props> {
  componentDidMount() {
    const { points } = this.props;

    this.selectSVGElement();
    this.drawAxes(points);
    this.drawPoints(points);
    this.drawLines();
  }

  selectSVGElement() {
    this.svg = select('#chart')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${fullWidth} ${fullHeight}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  }

  drawAxes(points) {
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

    this.x = x;
    this.y = y;
  }

  drawPoints(points) {
    this.svg
      .selectAll('circle')
      .data(points)
      .enter()
      .append('circle')
      .attr('cx', d => this.x(d.x))
      .attr('cy', d => this.y(d.y))
      .attr('r', 3)
      .attr('fill', 'red');
  }

  drawLines(vectors) {
    console.log(vectors);

    this.svg
      .append('line')
      .style('stroke', 'blue')
      .style('stroke-width', 2)
      .attr('x1', this.x(0))
      .attr('y1', this.y(0))
      .attr('x2', this.x(1))
      .attr('y2', this.y(1));
  }

  render() {
    return <svg id="chart" />;
  }
}
