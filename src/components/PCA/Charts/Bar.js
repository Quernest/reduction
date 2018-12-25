// @flow
import React, { Component } from 'react';
import {
  select, scaleLinear, scaleBand, axisBottom, axisLeft, max,
} from 'd3';
import { Typography } from '@material-ui/core';
import { round, transform } from 'lodash';

type Props = {
  values: Array<number>,
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
    const { values, names, analysis } = this.props;

    // transform to array of objects
    const data: Array<{ name: string, value: number }> = transform(
      values,
      (acc: Array<{ name: string, value: number }>, curr: number, i: number) => {
        acc.push({
          name: names[i],
          value: round(curr, 3),
        });

        return acc;
      },
      [],
    );

    this.selectSVGElement();
    this.drawAxes(data, analysis);
    this.drawBars(data, analysis);
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

  drawAxes(data: Array<{ name: string, value: number }>, analysis: Array<number>): void {
    const { width, height } = this.state;
    const padding = 0.25;

    this.x = scaleBand()
      .range([0, width])
      .padding(padding)
      .domain(data.map((d, i) => `${d.name} (${analysis[i]}%)`));
    this.y = scaleLinear()
      .range([height, 0])
      .domain([0, max(data, d => d.value)]);

    this.svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(axisBottom(this.x));

    this.svg.append('g').call(axisLeft(this.y));
  }

  drawBars(data: Array<{ name: string, value: number }>, analysis: Array<number>): void {
    const { height } = this.state;

    this.svg
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('fill', 'steelblue')
      .attr('x', (d, i) => this.x(`${d.name} (${analysis[i]}%)`))
      .attr('width', this.x.bandwidth())
      .attr('y', d => this.y(d.value))
      .attr('height', d => height - this.y(d.value));
  }

  render() {
    return (
      <>
        <Typography variant="h5">Bar chart</Typography>
        <svg id="bar" />
      </>
    );
  }
}
