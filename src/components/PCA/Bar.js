// @flow

import React, { Component } from 'react';
import {
  select, scaleLinear, scaleBand, axisBottom, axisLeft, max,
} from 'd3';
import { round } from 'lodash';

type Props = {
  values: Array<number>,
  names: Array<string>,
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

export default class Bar extends Component<Props, State> {
  state = {
    margin: {
      top: 20,
      right: 20,
      bottom: 30,
      left: 40,
    },
    fullWidth: 825,
    fullHeight: 425,
    get width() {
      return this.fullWidth - this.margin.left - this.margin.right;
    },
    get height() {
      return this.fullHeight - this.margin.top - this.margin.bottom;
    },
  };

  componentDidMount() {
    // const { values } = this.props;

    // const formattedValues = values.map(value => round(value, 3));

    // fake data
    const data: Array<{ name: string, value: number }> = [
      {
        name: 'PC1',
        value: 1.95,
      },
      {
        name: 'PC2',
        value: 0.55,
      },
      {
        name: 'PC3',
        value: 0.25,
      },
      {
        name: 'PC4',
        value: 0.05,
      },
    ];

    this.selectSVGElement();
    this.drawAxes(data);
    this.drawBars(data);
  }

  selectSVGElement(): void {
    const { margin, fullWidth, fullHeight } = this.state;

    this.svg = select('#bar')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${fullWidth} ${fullHeight}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  }

  drawAxes(data: Array<{ name: string, value: number }>): void {
    const { width, height } = this.state;

    this.x = scaleBand()
      .range([0, width])
      .padding(0.5)
      .domain(data.map(d => d.name));
    this.y = scaleLinear()
      .range([height, 0])
      .domain([0, max(data, d => d.value)]);

    this.svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(axisBottom(this.x));

    this.svg.append('g').call(axisLeft(this.y));
  }

  drawBars(data: Array<{ name: string, value: number }>): void {
    const { height } = this.state;

    this.svg
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('fill', 'steelblue')
      .attr('x', d => this.x(d.name))
      .attr('width', this.x.bandwidth())
      .attr('y', d => this.y(d.value))
      .attr('height', d => height - this.y(d.value));
  }

  render() {
    return <svg id="bar" />;
  }
}
