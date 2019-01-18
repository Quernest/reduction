// @flow
import * as React from "react";
import * as d3 from "d3";
import { withStyles, createStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { from2D, IObject } from "../../utils/transformations";

export interface IProps {
  values: number[];
  names: string[];
  analysis: number[];
  classes?: any;
}

export interface IState {
  fullWidth: number;
  fullHeight: number;
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

class Bar extends React.Component<IProps, IState> {
  // main svg element
  private svg: d3.Selection<d3.BaseType, any, HTMLElement, any>;

  // x axis
  private x: d3.ScaleBand<string>;

  // y axis
  private y: d3.ScaleLinear<number, number>;

  public readonly state = {
    margin: {
      top: 20,
      right: 20,
      bottom: 30,
      left: 40
    },
    fullWidth: 960,
    fullHeight: 425,
    get width(): number {
      return this.fullWidth - this.margin.left - this.margin.right;
    },
    get height(): number {
      return this.fullHeight - this.margin.top - this.margin.bottom;
    }
  };

  public componentDidMount() {
    const { values, names, analysis } = this.props;

    // combination of values ​​that we display
    const combinedData: [string[], number[], number[]] = [
      names,
      values,
      analysis
    ];

    // keys of this values
    const keys: string[] = ["component", "eigenvalue", "comulative"];

    // formatted data which represents a collection of objects with provided keys and values
    const data: {
      component?: string;
      eigenvalue?: number;
      comulative?: number;
    }[] = from2D(combinedData, keys);

    this.selectSVGElement();
    this.drawAxes(data);
    this.drawBars(data);
  }

  private selectSVGElement(): void {
    const { margin, fullWidth, fullHeight } = this.state;

    this.svg = d3
      .select("#bar")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${fullWidth} ${fullHeight}`)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  }

  private drawAxes(
    data: Array<{
      component?: string;
      eigenvalue?: number;
      comulative?: number;
    }>
  ): void {
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
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(this.x));

    this.svg.append("g").call(d3.axisLeft(this.y));
  }

  private drawBars(
    data: Array<{
      component?: string;
      eigenvalue?: number;
      comulative?: number;
    }>
  ): void {
    const { height } = this.state;

    this.svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("fill", "#3F51B5")
      .attr("x", d => this.x(d.component))
      .attr("width", this.x.bandwidth())
      .attr("y", d => this.y(d.comulative))
      .attr("height", d => height - this.y(d.comulative));

    // the text labels at the top of each bar.
    this.svg
      .selectAll(".text")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => this.x(d.component) + this.x.bandwidth() / 2)
      .attr("y", d => this.y(d.comulative) - 15)
      .attr("dy", ".75em")
      .style("text-anchor", "middle")
      //  change text size depending on data size
      .style("font-size", data.length > 15 ? 10 : 12)
      // display percentage
      .text(d => `${d.comulative}%`);
  }

  public render(): React.ReactNode {
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

const styles = createStyles({
  root: {
    width: "100%",
    height: "auto"
  }
});

export default withStyles(styles)(Bar);
