import { createStyles, withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import * as d3 from "d3";
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
  title?: string;
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
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
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

    /**
     * main svg element
     */
    private svg: d3.Selection<d3.BaseType, any, HTMLElement, any>;

    /**
     * x linear scale
     */
    private x: d3.ScaleLinear<number, number>;

    /**
     * y linear scale
     */
    private y: d3.ScaleLinear<number, number>;

    // axes
    private axisTop: d3.Axis<number | { valueOf(): number }>;
    private axisBottom: d3.Axis<number | { valueOf(): number }>;
    private axisLeft: d3.Axis<number | { valueOf(): number }>;
    private axisRight: d3.Axis<number | { valueOf(): number }>;

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

      // x scale
      this.x = d3
        .scaleLinear()
        .rangeRound([0, width])
        .domain([
          -d3.max(points, (d: IPoint): any => Math.abs(d.x)),
          d3.max(points, (d: IPoint): any => Math.abs(d.x))
        ]);

      // y scale
      this.y = d3
        .scaleLinear()
        .rangeRound([0, height])
        .domain([
          d3.max(points, (d: IPoint): any => Math.abs(d.y)),
          -d3.max(points, (d: IPoint): any => Math.abs(d.y))
        ]);

      // left axis
      this.axisLeft = d3.axisLeft(this.y);

      // svg element of left axis
      this.svg
        .append("g")
        .attr("transform", `translate(0, 0)`)
        .call(this.axisLeft);

      // top axis
      this.axisTop = d3.axisTop(this.x);

      // svg element of top axis
      this.svg
        .append("g")
        .attr("transform", `translate(0, 0)`)
        .call(this.axisTop);

      // right axis
      this.axisRight = d3.axisRight(this.y);

      // svg element of right axis
      this.svg
        .append("g")
        .attr("transform", `translate(${width}, 0)`)
        .call(this.axisRight);

      // bottom axis
      this.axisBottom = d3.axisBottom(this.x);

      // svg element of bottom axis
      this.svg
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(this.axisBottom);

      // left label
      this.svg
        .append("text")
        .text("Component 2")
        .attr("x", 0 - height / 2)
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .style("font-size", "12px")
        .style("text-anchor", "middle")
        .attr("transform", "rotate(-90)");

      // bottom label
      this.svg
        .append("text")
        .text("Component 1")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .attr("dy", "-1em")
        .style("font-size", "12px")
        .style("text-anchor", "middle");
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
          const x: number = value;

          /**
           * current y value
           */
          const y: number = ys[i];

          /**
           * current variable
           */
          // const variable: string = names[i];

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

          // create label
          // this.svg
          //   .append("text")
          //   .attr("x", this.x(x))
          //   .attr("y", this.y(y))
          //   .attr("text-anchor", "middle")
          //   .style("font-size", "10px")
          //   .text(variable);
        });
      }
    }

    public render() {
      const { classes, title } = this.props;

      return (
        <div className={classes.root}>
          {title && (
            <Typography variant="h6" paragraph={true}>
              {title}
            </Typography>
          )}
          <svg id="biplot" />
        </div>
      );
    }
  }
);
