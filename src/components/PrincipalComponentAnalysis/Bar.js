// @flow
import React from 'react';
import * as d3 from 'd3';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { transform2DArrayToArrayOfObjects } from '../../utils/transformations';

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
    fullWidth: 960,
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

    // keys
    const keys: Array<string> = ['component', 'eigenvalue', 'comulative'];

    const data: Array<{
      component: string,
      eigenvalue: number,
      comulative: number,
    }> = transform2DArrayToArrayOfObjects([names, values, analysis], keys);

    this.selectSVGElement();
    this.drawAxes(data);
    this.drawBars(data);
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

  drawAxes(data): void {
    const { width, height } = this.state;

    this.x = d3
      .scaleBand()
      .range([0, width])
      .padding(0.25)
      .domain(data.map(d => d.component));
    this.y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, 100]);

    this.svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(this.x));

    this.svg.append('g').call(d3.axisLeft(this.y));
  }

  drawBars(data): void {
    const { height } = this.state;

    this.svg
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('fill', '#3F51B5')
      .attr('x', d => this.x(d.component))
      .attr('width', this.x.bandwidth())
      .attr('y', d => this.y(d.comulative))
      .attr('height', d => height - this.y(d.comulative));

    // the text labels at the top of each bar.
    this.svg
      .selectAll('.text')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => this.x(d.component) + this.x.bandwidth() / 2)
      .attr('y', d => this.y(d.comulative) - 15)
      .attr('dy', '.75em')
      .style('text-anchor', 'middle')
      //  change text size depending on data size
      .style('font-size', data.length > 15 ? 10 : 12)
      // display percentage
      .text(d => `${d.comulative}%`);
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
