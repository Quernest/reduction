import { createStyles, withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import * as d3 from "d3";
import size from "lodash/size";
import * as React from "react";
import { IChart } from "src/models/chart.model";

const styles = createStyles({
  root: {
    width: "100%"
  },
  svgContainer: {
    position: "relative",
    height: 0,
    width: "100%",
    padding: 0 // reset
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%"
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
     * zoom listener
     */
    private zoom: d3.ZoomBehavior<Element, {}>;

    /**
     * clip-path (wrapper for view)
     */
    private clip: d3.Selection<d3.BaseType, any, HTMLElement, any>;

    /**
     * group element for zooming
     * append here translating elements
     */
    private view: d3.Selection<d3.BaseType, any, HTMLElement, any>;

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

    // axes g (group) elements
    private gAxisTop: d3.Selection<d3.BaseType, any, HTMLElement, any>;
    private gAxisBottom: d3.Selection<d3.BaseType, any, HTMLElement, any>;
    private gAxisLeft: d3.Selection<d3.BaseType, any, HTMLElement, any>;
    private gAxisRight: d3.Selection<d3.BaseType, any, HTMLElement, any>;

    public componentDidMount() {
      const { points, eigenvectors, names } = this.props;

      this.selectSVGElement();
      this.createDefs();
      this.drawAxes(points);
      this.drawPoints(points);
      this.drawVectors(eigenvectors, names);
    }

    private onZoom = () => {
      const { eigenvectors, names } = this.props;
      const { transform } = d3.event;

      // update view
      this.view.attr("transform", transform);

      // update x axes
      this.gAxisTop.call(this.axisTop.scale(transform.rescaleX(this.x)));
      this.gAxisBottom.call(this.axisBottom.scale(transform.rescaleX(this.x)));

      // update y axes
      this.gAxisLeft.call(this.axisLeft.scale(transform.rescaleY(this.y)));
      this.gAxisRight.call(this.axisRight.scale(transform.rescaleY(this.y)));

      // remove previous created elements
      this.svg.selectAll("line.vector").remove();
      this.svg.selectAll("text.variable").remove();

      // redraw elemenets
      this.drawVectors(eigenvectors, names, transform.k);
    };

    private selectSVGElement(): void {
      const { fullWidth, fullHeight, margin } = this.state;

      this.zoom = d3
        .zoom()
        .scaleExtent([1, 3])
        // .translateExtent([[0, 0], [this.state.width, this.state.height]])
        // .extent([[0, 0], [this.state.width, this.state.height]])
        .on("zoom", this.onZoom);

      this.svg = d3
        .select("#biplot")
        .attr("viewBox", `0 0 ${fullWidth} ${fullHeight}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .call(this.zoom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      /**
       * append group with clip-path
       */
      this.clip = this.svg.append("g").attr("clip-path", "url(#clip)");

      /**
       * append view
       */
      this.view = this.clip.append("g").attr("pointer-events", "all");
    }

    private createDefs(): void {
      const { width, height } = this.state;
      const defs = this.svg.append("defs");

      // append markers for vectors
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

      // append clip-path
      defs
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);
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
      this.gAxisLeft = this.svg
        .append("g")
        .attr("transform", `translate(0, 0)`)
        .call(this.axisLeft);

      // top axis
      this.axisTop = d3.axisTop(this.x);

      // svg element of top axis
      this.gAxisTop = this.svg
        .append("g")
        .attr("transform", `translate(0, 0)`)
        .call(this.axisTop);

      // right axis
      this.axisRight = d3.axisRight(this.y);

      // svg element of right axis
      this.gAxisRight = this.svg
        .append("g")
        .attr("transform", `translate(${width}, 0)`)
        .call(this.axisRight);

      // bottom axis
      this.axisBottom = d3.axisBottom(this.x);

      // svg element of bottom axis
      this.gAxisBottom = this.svg
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
        .attr("dy", "-0.75em")
        .style("font-size", "12px")
        .style("text-anchor", "middle");
    }

    /**
     * draw points on 2d scatter
     * @param points points for scatter plot
     * @param k zooming coeff
     */
    private drawPoints(points: IPoint[], k: number = 1): void {
      this.view
        .selectAll("circle.point")
        .data(points)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("cx", (d: IPoint): number => this.x(d.x * k))
        .attr("cy", (d: IPoint): number => this.y(d.y * k))
        .attr("r", 2 * k)
        .attr("fill", "red");
    }

    /**
     * draw eigenvectors (component loadings)
     * @param eigenvectors array of eigenvectors
     * @param names factor names
     * @param k zooming coeff
     */
    private drawVectors(
      eigenvectors: number[][],
      names: string[],
      k: number = 1
    ): void {
      const getColumn = (arr: number[][], n: number) => arr.map(x => x[n]);
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
          const variable: string = names[i];

          // plot the vector
          this.view
            .append("line")
            .attr("class", "vector")
            .style("stroke", "#000")
            .style("stroke-width", 1.5)
            .attr("x1", this.x(0))
            .attr("y1", this.y(0))
            .attr("x2", this.x(x * k))
            .attr("y2", this.y(y * k))
            .attr("marker-end", "url(#arrow)");

          // todo: align by vector angle
          this.view
            .append("text")
            .attr("class", "variable")
            .attr("x", this.x(x * k))
            .attr("y", this.y(y * k))
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text(variable);
        });
      }
    }

    public render() {
      const { classes, title } = this.props;
      const { fullWidth, fullHeight } = this.state;

      return (
        <div className={classes.root}>
          {title && (
            <Typography variant="h6" paragraph={true}>
              {title}
            </Typography>
          )}
          <div
            className={classes.svgContainer}
            style={{ paddingBottom: `${(fullHeight / fullWidth) * 100}%` }}
          >
            <svg className={classes.svg} id="biplot" />
          </div>
        </div>
      );
    }
  }
);
