import { createStyles, withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import * as d3 from "d3";
import size from "lodash/size";
import * as math from "mathjs";
import * as React from "react";

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
  vectors: number[][];
  axes: string[];
  classes?: any;
}

interface IState {
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

export const Biplot = withStyles(styles)(
  class extends React.Component<IProps, IState> {
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
    /**
     * main svg element
     */
    private svg: d3.Selection<d3.BaseType, any, HTMLElement, any>;

    /**
     * x axis
     */
    private x: d3.ScaleLinear<number, number>;

    /**
     * y axis
     */
    private y: d3.ScaleLinear<number, number>;

    public componentDidMount() {
      const { points, vectors, axes } = this.props;

      // 2D only
      if (size(axes) > 2) {
        return;
      }

      this.selectSVGElement();
      this.drawAxes(points, axes);
      this.drawPoints(points);
      this.drawVectors(vectors);
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

    private drawAxes(points: IPoint[], axes: string[]): void {
      const { width, height, margin } = this.state;

      const xScale = d3
        .scaleLinear()
        .rangeRound([0, width])
        .domain([
          -d3.max(points, (d: IPoint): any => math.abs(d.x)),
          d3.max(points, (d: IPoint): any => math.abs(d.x))
        ]);

      const xAxis = d3.axisBottom(xScale);

      const yScale = d3
        .scaleLinear()
        .rangeRound([0, height])
        .domain([
          d3.max(points, (d: IPoint): any => math.abs(d.y)),
          -d3.max(points, (d: IPoint): any => math.abs(d.y))
        ]);

      const yAxis = d3.axisLeft(yScale);

      this.svg
        .append("g")
        .attr("transform", `translate(0, ${height / 2})`)
        .call(xAxis);

      this.svg
        .append("text")
        .text(axes[1])
        .attr("x", 0 - height / 2)
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .style("font-size", 12)
        .style("text-anchor", "middle")
        .attr("transform", "rotate(-90)");

      this.svg
        .append("g")
        .attr("transform", `translate(${width / 2}, 0)`)
        .call(yAxis);

      this.svg
        .append("text")
        .text(axes[0])
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .attr("dy", "-1em")
        .style("font-size", 12)
        .style("text-anchor", "middle");

      this.svg
        .selectAll(".tick")
        .filter(d => d === 0)
        .remove();

      this.x = xScale;
      this.y = yScale;
    }

    private drawPoints(points: IPoint[]): void {
      this.svg
        .selectAll("circle")
        .data(points)
        .enter()
        .append("circle")
        .attr("cx", (d: IPoint): any => this.x(d.x))
        .attr("cy", (d: IPoint): any => this.y(d.y))
        .attr("r", 2)
        .attr("fill", "red");
    }

    private drawVectors(vectors: number[][]): void {
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

      this.svg
        .append("line")
        .style("stroke", "#000")
        .style("stroke-width", 1.5)
        .attr("x1", this.x(-vectors[0][0]))
        .attr("y1", this.y(-vectors[1][0]))
        .attr("x2", this.x(vectors[0][0]))
        .attr("y2", this.y(vectors[1][0]))
        .attr("marker-end", "url(#arrow)");
      this.svg
        .append("line")
        .style("stroke", "#000")
        .style("stroke-width", 1.5)
        .attr("x1", this.x(-vectors[0][1]))
        .attr("y1", this.y(-vectors[1][1]))
        .attr("x2", this.x(vectors[0][1]))
        .attr("y2", this.y(vectors[1][1]))
        .attr("marker-end", "url(#arrow)");
    }

    public render() {
      const { axes, classes } = this.props;

      // 2D only
      if (size(axes) > 2) {
        return null;
      }

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
