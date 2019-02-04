import { createStyles, withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import * as d3 from "d3";
import * as React from "react";
import { IChart, Points, Vectors } from "src/models/chart.model";

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
  points: Points;
  eigenvectors: Vectors;
  names: string[];
  classes?: any;
  xAxisLabel: string;
  yAxisLabel: string;
}

interface IState {
  transform: {
    k: number;
    x: number;
    y: number;
  };
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
      transform: {
        k: 1,
        x: 0,
        y: 0
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
      // redraw elements if axis changed
      if (
        this.props.xAxisLabel !== props.xAxisLabel ||
        this.props.yAxisLabel !== props.yAxisLabel
      ) {
        const { xAxisLabel, yAxisLabel, points } = this.props;

        // remove labels
        this.svg.select("text.axis-x-label").remove();
        this.svg.select("text.axis-y-label").remove();

        // remove axes
        this.gAxisLeft.remove();
        this.gAxisTop.remove();
        this.gAxisRight.remove();
        this.gAxisBottom.remove();

        // redraw axes
        this.drawAxes(points, xAxisLabel, yAxisLabel);

        // update zoom
        this.svg.call(
          this.zoom.transform,
          d3.zoomIdentity
            .translate(this.state.transform.x, this.state.transform.y)
            .scale(this.state.transform.k)
        );
      }
    }

    private onZoom = () => {
      const { eigenvectors, names, points } = this.props;
      const { transform } = d3.event;

      const newX = transform.rescaleX(this.x);
      const newY = transform.rescaleY(this.y);

      // update state
      this.setState({
        transform
      });

      // update view
      this.view.attr("transform", transform);

      // update x axes
      this.gAxisTop.call(this.axisTop.scale(newX));
      this.gAxisBottom.call(this.axisBottom.scale(newX));

      // update y axes
      this.gAxisLeft.call(this.axisLeft.scale(newY));
      this.gAxisRight.call(this.axisRight.scale(newY));

      // remove created elements
      this.view.selectAll("line.vector").remove();
      this.view.selectAll("text.variable").remove();
      this.view.selectAll("circle.point").remove();

      // redraw points
      this.drawPoints(points);

      // redraw vectors
      this.drawVectors(eigenvectors, names);
    };

    private selectSVGElement(): void {
      const { fullWidth, fullHeight, margin } = this.state;

      this.zoom = d3
        .zoom()
        .scaleExtent([1 / 2, 4])
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
      points: Points,
      xAxisLabel: string,
      yAxisLabel: string
    ): void {
      const { width, height } = this.state;
      const [xPoints, yPoints] = points;

      /**
       * max x axis value
       */
      const xMax: number = d3.max(xPoints) as number;

      /**
       * max y axis value
       */
      const yMax: number = d3.max(yPoints) as number;

      // x scale
      this.x = d3
        .scaleLinear()
        .domain([-xMax, xMax])
        .rangeRound([0, width]);

      // y scale
      this.y = d3
        .scaleLinear()
        .domain([yMax, -yMax])
        .rangeRound([0, height]);

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
    private drawPoints(points: Points): void {
      const { k } = this.state.transform;

      /**
       * xPoints and yPoints always have same size
       * so we can draw points in this way
       * without transforming data to array of {x, y}
       */
      const [xPoints, yPoints] = points;

      this.view
        .selectAll("circle.point")
        .data(xPoints)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("cx", (_: number, i: number): number => this.x(xPoints[i] * k))
        .attr("cy", (_: number, i: number): number => this.y(yPoints[i] * k))
        .attr("r", 2)
        .attr("fill", "red");
    }

    /**
     * draw eigenvectors (component loadings)
     * @param eigenvectors array of eigenvectors
     * @param names factor names
     */
    private drawVectors(eigenvectors: Vectors, names: string[]): void {
      const { k } = this.state.transform;
      // the length of each points collection is equal
      const [x1Points, y1Points, x2Points, y2Points] = eigenvectors;

      this.view
        .selectAll("line.vector")
        .data(x1Points)
        .enter()
        .append("line")
        .attr("class", "vector")
        .style("stroke", "#000")
        .style("stroke-width", 1.5)
        .attr("x1", (_: number, i: number): any => this.x(x1Points[i] * k))
        .attr("y1", (_: number, i: number): any => this.y(y1Points[i] * k))
        .attr("x2", (_: number, i: number): any => this.x(x2Points[i] * k))
        .attr("y2", (_: number, i: number): any => this.y(y2Points[i] * k))
        .attr("marker-end", "url(#arrow)");

      this.view
        .selectAll("text.variable")
        .data(x1Points)
        .enter()
        .append("text")
        .attr("class", "variable")
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .attr(
          "transform",
          (_: number, i: number): any => {
            /**
             * angle of current vector
             */
            const angle: number =
              (Math.atan2(
                this.y(y2Points[i] * k) - this.y(y1Points[i]),
                this.x(x2Points[i] * k) - this.x(x1Points[i])
              ) *
                180) /
              Math.PI;

            /**
             * distance from the end of arrow to the text (variable)
             */
            const dev: number = angle >= 0 ? 12 : -6;

            // translate text position
            return `translate(${this.x(x2Points[i] * k)},${this.y(
              y2Points[i] * k
            ) + dev})`;
          }
        )
        .text((d: number, i: number): string => names[i]);
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
