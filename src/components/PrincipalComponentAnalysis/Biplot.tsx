import { createStyles, withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import * as d3 from "d3";
import * as React from "react";
import { IChart, IPoint, IVector } from "src/models/chart.model";

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

interface IProps {
  title?: string;
  points: IPoint[];
  eigenvectors: IVector[];
  names: string[];
  classes?: any;
  xAxisLabel: string;
  yAxisLabel: string;
}

interface IState {
  k: number;
}

/**
 * Biplot of score variables
 */
export const Biplot = withStyles(styles)(
  class extends React.Component<IProps, IChart & IState> {
    public static readonly defaultProps = {
      xAxisLabel: "x",
      yAxisLabel: "y"
    };

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
      },
      k: 1
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
      const {
        points,
        eigenvectors,
        names,
        xAxisLabel,
        yAxisLabel
      } = this.props;

      this.selectSVGElement();
      this.createDefs();
      this.drawAxes(points, xAxisLabel, yAxisLabel);
      this.drawPoints(points);
      this.drawVectors(eigenvectors, names);
    }

    public componentDidUpdate(props: IProps) {
      if (this.props.eigenvectors !== props.eigenvectors) {
        const { eigenvectors, names, xAxisLabel, yAxisLabel } = this.props;

        // remove vectors
        this.view.selectAll("line.vector").remove();
        this.view.selectAll("text.variable").remove();

        // remove labels
        this.svg.select("text.axis-x-label").remove();
        this.svg.select("text.axis-y-label").remove();

        // redraw vectors
        this.drawVectors(eigenvectors, names);

        // redraw labels
        this.drawAxesLabels(xAxisLabel, yAxisLabel);
      }
    }

    private onZoom = () => {
      const { eigenvectors, names, points } = this.props;
      const { transform } = d3.event;

      // update state
      this.setState({
        k: transform.k
      });

      // update view
      this.view.attr("transform", transform);

      // update x axes
      this.gAxisTop.call(this.axisTop.scale(transform.rescaleX(this.x)));
      this.gAxisBottom.call(this.axisBottom.scale(transform.rescaleX(this.x)));

      // update y axes
      this.gAxisLeft.call(this.axisLeft.scale(transform.rescaleY(this.y)));
      this.gAxisRight.call(this.axisRight.scale(transform.rescaleY(this.y)));

      // remove created elements
      this.view.selectAll("line.vector").remove();
      this.view.selectAll("text.variable").remove();
      this.view.selectAll("circle.point").remove();

      // redraw elemenets
      this.drawPoints(points);
      this.drawVectors(eigenvectors, names);
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

    private drawAxes(
      points: IPoint[],
      xAxisLabel: string,
      yAxisLabel: string
    ): void {
      const { width, height } = this.state;

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

      this.drawAxesLabels(xAxisLabel, yAxisLabel);
    }

    private drawAxesLabels(xAxisLabel: string, yAxisLabel: string): void {
      const { width, height, margin } = this.state;

      // bottom label
      this.svg
        .append("text")
        .attr("class", "axis-x-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .attr("dy", "-0.75em")
        .style("font-size", "12px")
        .style("text-anchor", "middle")
        .text(xAxisLabel);

      // left label
      this.svg
        .append("text")
        .attr("class", "axis-y-label")
        .attr("x", 0 - height / 2)
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .style("font-size", "12px")
        .style("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text(yAxisLabel);
    }

    /**
     * draw points on 2d scatter
     * @param points points for scatter plot
     */
    private drawPoints(points: IPoint[]): void {
      const { k } = this.state;

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
     */
    private drawVectors(eigenvectors: IVector[], names: string[]): void {
      const { k } = this.state;

      this.view
        .selectAll("line.vector")
        .data(eigenvectors)
        .enter()
        .append("line")
        .attr("class", "vector")
        .style("stroke", "#000")
        .style("stroke-width", 1.5)
        .attr("x1", (d: IVector): any => this.x(d.x1 * k))
        .attr("y1", (d: IVector): any => this.y(d.y1 * k))
        .attr("x2", (d: IVector): any => this.x(d.x2 * k))
        .attr("y2", (d: IVector): any => this.y(d.y2 * k))
        .attr("marker-end", "url(#arrow)");

      this.view
        .selectAll("text.variable")
        .data(eigenvectors)
        .enter()
        .append("text")
        .attr("class", "variable")
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .attr(
          "transform",
          (d: IVector): any => {
            /**
             * angle of current vector
             */
            const angle: number =
              (Math.atan2(
                this.y(d.y2 * k) - this.y(d.y1),
                this.x(d.x2 * k) - this.x(d.x1)
              ) *
                180) /
              Math.PI;

            /**
             * distance from the end of arrow to the text (variable)
             */
            const dev: number = angle >= 0 ? 12 : -6;

            // translate text position
            return `translate(${this.x(d.x2 * k)},${this.y(d.y2 * k) + dev})`;
          }
        )
        .text((d: IVector, i: number): string => names[i]);
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
