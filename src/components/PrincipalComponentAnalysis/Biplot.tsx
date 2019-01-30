import { createStyles, withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import * as d3 from "d3";
import round from "lodash/round";
import size from "lodash/size";
import * as React from "react";
import { IChart } from "src/models/chart.model";

const styles = createStyles({
  root: {
    height: "auto",
    width: "100%"
  }
});

interface IPoint {
  x: number;
  y: number;
}

interface IProps {
  points: IPoint[];
  eigenvectors: number[][];
  names: string[];
  classes?: any;
}

/**
 * Biplot of score variables
 */
export const Biplot = withStyles(styles)(
  class extends React.Component<IProps, IChart> {
    public readonly state = {
      margin: {
        top: 20,
        right: 20,
        bottom: 35,
        left: 35
      },
      fullWidth: 960,
      fullHeight: 625,
      get width() {
        return this.fullWidth - this.margin.left - this.margin.right;
      },
      get height() {
        return this.fullHeight - this.margin.top - this.margin.bottom;
      }
    };

    private svg: d3.Selection<d3.BaseType, any, HTMLElement, any>;

    private x: d3.ScaleLinear<number, number>;
    private y: d3.ScaleLinear<number, number>;

    private xAxis: d3.Axis<
      | number
      | {
          valueOf(): number;
        }
    >;

    private yAxis: d3.Axis<
      | number
      | {
          valueOf(): number;
        }
    >;

    public componentDidMount() {
      const { points, eigenvectors, names } = this.props;

      this.selectSVGElement();
      this.drawAxes(points);
      this.drawPoints(points);
      this.drawVectors(eigenvectors, names);
    }

    private selectSVGElement(): void {
      const { fullWidth, fullHeight, margin } = this.state;

      this.svg = d3
        .select("#biplot")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${fullWidth} ${fullHeight}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    }

    private drawAxes(points: IPoint[]): void {
      const { width, height, margin } = this.state;

      this.x = d3
        .scaleLinear()
        .rangeRound([0, width])
        .domain([
          -d3.max(points, (d: IPoint): any => Math.abs(d.x)),
          d3.max(points, (d: IPoint): any => Math.abs(d.x))
        ]);

      this.xAxis = d3.axisBottom(this.x);

      this.y = d3
        .scaleLinear()
        .rangeRound([0, height])
        .domain([
          d3.max(points, (d: IPoint): any => Math.abs(d.y)),
          -d3.max(points, (d: IPoint): any => Math.abs(d.y))
        ]);

      this.yAxis = d3.axisLeft(this.y);

      this.svg
        .append("g")
        .attr("transform", `translate(0, ${height / 2})`)
        .call(this.xAxis);

      this.svg
        .append("g")
        .attr("transform", `translate(${width / 2}, 0)`)
        .call(this.yAxis);

      this.svg
        .append("text")
        .text("Component 2")
        .attr("x", 0 - height / 2)
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .style("font-size", "12px")
        .style("text-anchor", "middle")
        .attr("transform", "rotate(-90)");

      this.svg
        .append("text")
        .text("Component 1")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .attr("dy", "-1em")
        .style("font-size", "12px")
        .style("text-anchor", "middle");

      this.svg
        .selectAll(".tick")
        .filter(d => d === 0)
        .remove();
    }

    private drawPoints(points: IPoint[]): void {
      this.svg
        .selectAll("circle")
        .data(points)
        .enter()
        .append("circle")
        .attr("cx", (d: IPoint): number => this.x(d.x))
        .attr("cy", (d: IPoint): number => this.y(d.y))
        .attr("r", 2)
        .attr("fill", "red");
    }

    private drawVectors(eigenvectors: number[][], names: string[]): void {
      const getColumn = (arr: number[][], n: number) => arr.map(x => x[n]);

      const defs = this.svg.append("defs");
      const marker = defs
        .append("marker")
        .attr("id", "arrow")
        .attr("markerUnits", "strokeWidth")
        .attr("markerWidth", 12)
        .attr("markerHeight", 12)
        .attr("viewBox", "0 0 12 12")
        .attr("refX", 6)
        .attr("refY", 6)
        .attr("orient", "auto");

      marker.append("path").attr("d", "M2,2 L10,6 L2,10 L6,6 L2,2");

      /**
       * collection of x values
       */
      const xs: number[] = getColumn(eigenvectors, 0);

      /**
       * collection of y values
       */
      const ys: number[] = getColumn(eigenvectors, 1);

      // if xs and ys are the same length
      if (size(xs) === size(ys)) {
        // plot the eigenvectors
        xs.forEach((value: number, i: number) => {
          /**
           * current x value
           */
          const x: number = round(value, 3);

          /**
           * current y value
           */
          const y: number = round(ys[i], 3);

          /**
           * current variable
           */
          const variable: string = names[i];

          // plot the vector
          this.svg
            .append("line")
            .style("stroke", "#000")
            .style("stroke-width", 1.5)
            .attr("x1", this.x(0))
            .attr("y1", this.y(0))
            .attr("x2", this.x(x))
            .attr("y2", this.y(y))
            .attr("marker-end", "url(#arrow)");

          this.svg
            .append("text")
            .attr("x", this.x(x))
            .attr("y", this.y(y))
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text(`${variable} (${x}, ${y})`);
        });
      }
    }

    public render() {
      const { classes } = this.props;

      return (
        <div className={classes.root}>
          <Typography variant="h6" paragraph={true}>
            Biplot
          </Typography>
          <svg id="biplot" />
        </div>
      );
    }
  }
);
