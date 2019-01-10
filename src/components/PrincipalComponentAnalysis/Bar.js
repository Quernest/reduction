// @flow
import React from 'react';
import * as d3 from 'd3';
import round from 'lodash/round';
import transform from 'lodash/transform';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

type Props = {
  values: Array<number>,
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

class Bar extends React.Component<Props, State> {
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
      (
        acc: Array<{ name: string, value: number }>,
        curr: number,
        i: number,
      ) => {
        acc.push({
          name: names[i],
          value: round(curr, 3),
        });

        return acc;
      },
      [],
    );

    this.selectSVGElement();
    this.drawAxes(data);
    this.drawBars(data, analysis);
  }

  selectSVGElement(): void {
    const { margin, fullWidth, fullHeight } = this.state;

    this.svg = d3
      .select('#bar')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${fullWidth} ${fullHeight}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  }

  drawAxes(data: Array<{ name: string, value: number }>): void {
    const { width, height } = this.state;
    const padding = 0.25;

    this.x = d3
      .scaleBand()
      .range([0, width])
      .padding(padding)
      .domain(data.map(d => d.name));
    this.y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, d => d.value)]);

    this.svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(this.x));

    this.svg.append('g').call(d3.axisLeft(this.y));
  }

  drawBars(
    data: Array<{ name: string, value: number }>,
    analysis: Array<number>,
  ): void {
    const { height } = this.state;

    this.svg
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('fill', '#3F51B5')
      .attr('x', d => this.x(d.name))
      .attr('width', this.x.bandwidth())
      .attr('y', d => this.y(d.value))
      .attr('height', d => height - this.y(d.value));

    // the text labels at the top of each bar.
    this.svg
      .selectAll('.text')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => this.x(d.name) + this.x.bandwidth() / 2)
      .attr('y', d => this.y(d.value) - 15)
      .attr('dy', '.75em')
      .style('text-anchor', 'middle')
      //  change text size depending on data size
      .style('font-size', data.length > 15 ? 10 : 12)
      // if analysis reliable more than 70% fill label to the primary color
      .style('fill', (_, i) => (analysis[i] > 70 ? '#3F51B5' : '#000'))
      // display percentage
      .text((_, i) => `${analysis[i]}%`);
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Typography variant="h6" paragraph>
          Bar Chart
        </Typography>
        <svg id="bar" />
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

export default withStyles(styles)(Bar);