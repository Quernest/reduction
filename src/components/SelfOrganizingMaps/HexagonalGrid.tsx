import { createStyles, withStyles, WithStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { Neuron } from "@seracio/kohonen/dist/types";
import { range } from "d3-array";
import { scaleLinear } from "d3-scale";
import { interpolateGreys, interpolateSpectral } from "d3-scale-chromatic";
import { select } from "d3-selection";
import { line } from "d3-shape";
import has from "lodash/has";
import head from "lodash/head";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import isUndefined from "lodash/isUndefined";
import React, { Component, createRef, RefObject } from "react";
import {
  IChartState,
  IHexagonalGridDimensions,
  IMargin
} from "src/models/chart.model";

const styles = createStyles({
  root: {
    flexGrow: 1
  },
  title: {
    marginTop: 16,
    marginBottom: 8
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

interface IProps extends WithStyles<typeof styles> {
  title?: string;
  neurons: Neuron[];
  dimensions: IHexagonalGridDimensions;
  umatrix?: number[];
  heatmap?: boolean;
}

export const HexagonalGrid = withStyles(styles)(
  class extends Component<IProps, IChartState> {
    protected ref = createRef<SVGSVGElement>();
    protected ctx: any;
    protected grid: any;
    protected hexagons: any;
    protected hexagonRadius: number = 0;

    public readonly state = {
      margin: {
        left: 2,
        top: 2,
        right: 2,
        bottom: 2
      },
      fullWidth: 1280,
      fullHeight: 560,
      get width() {
        return this.fullWidth - this.margin.left - this.margin.right;
      },
      get height() {
        return this.fullHeight - this.margin.top - this.margin.bottom;
      }
    };

    public initContext({ fullWidth, fullHeight, margin }: IChartState) {
      if (this.ref) {
        this.getContext(this.ref);
        this.setContextAttributes(fullWidth, fullHeight, margin);
      }
    }

    public componentDidMount() {
      const { neurons, dimensions, umatrix, heatmap } = this.props;

      this.initContext(this.state);
      this.drawGrid(dimensions, neurons);

      // draw only if the heatmap is enabled and neuron have weights (v property)
      if (has(head(neurons), "v") && heatmap) {
        this.drawHeatmap(0);
      }

      if (!isUndefined(umatrix) && !isEmpty(umatrix)) {
        this.drawUMatrix(umatrix as number[]);
      }
    }

    public componentDidUpdate(props: IProps) {
      const { neurons, dimensions, umatrix, heatmap } = this.props;

      if (
        !isEqual(props.neurons, neurons) ||
        !isEqual(props.dimensions, dimensions)
      ) {
        this.drawGrid(dimensions, neurons);

        if (has(head(neurons), "v") && heatmap) {
          this.drawHeatmap(0);
        }
      }

      if (!isEqual(props.umatrix, umatrix)) {
        if (!isUndefined(umatrix) && !isEmpty(umatrix)) {
          this.drawUMatrix(umatrix as number[]);
        }
      }
    }

    public getContext({ current }: RefObject<SVGSVGElement>) {
      this.ctx = select(current);
    }

    public setContextAttributes(
      width: number,
      height: number,
      margin: IMargin
    ) {
      this.ctx = this.ctx
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    }

    /**
     * hexagonData are normalized such as 2 neighbors have a distance of 1
     * scale them to have this distance
     */
    public scaleGrid(hexagonSize: number) {
      return scaleLinear()
        .domain([0, 1])
        .range([0, hexagonSize]);
    }

    /**
     * computes the radius of an hexagon
     */
    public computeHexagonRadius(hexagonSize: number) {
      this.hexagonRadius = hexagonSize / 2 / Math.cos(Math.PI / 6);
    }

    /**
     * generates points of an hexagon
     */
    public getHexagonPoints([x, y]: [number, number], hexagonRadius: number) {
      return range(-Math.PI / 2, 2 * Math.PI, (2 * Math.PI) / 6).map<
        [number, number]
      >((a: number) => [
        x + Math.cos(a) * hexagonRadius,
        y + Math.sin(a) * hexagonRadius
      ]);
    }

    /**
     * draws the grid of hexagons by neurons positions
     */
    public drawGrid(
      { hexagonSize }: IHexagonalGridDimensions,
      neurons: Neuron[]
    ) {
      if (!isUndefined(this.grid)) {
        this.grid.exit();
        this.grid.remove();
      }

      this.computeHexagonRadius(hexagonSize);

      this.grid = this.ctx
        .append("g")
        .attr(
          "transform",
          `translate(${-hexagonSize / 2}, ${-hexagonSize + this.hexagonRadius})`
        );

      this.drawHexagons(hexagonSize, neurons);
    }

    /**
     * draws hexagons on the grid by neurons positions
     */
    public drawHexagons(hexagonSize: number, neurons: Neuron[]) {
      if (!isUndefined(this.hexagons)) {
        this.hexagons.exit();
        this.hexagons.remove();
      }

      // generate path of an hexagon
      const generatePath = ({ pos: [x, y] }: Neuron) => {
        const sX = this.scaleGrid(hexagonSize)(x);
        const sY = this.scaleGrid(hexagonSize)(y);

        const points = this.getHexagonPoints([sX, sY], this.hexagonRadius);

        return line()(points);
      };

      this.hexagons = this.grid
        .selectAll()
        .data(neurons)
        .enter()
        .append("path")
        .style("fill", "#e0e0e0")
        .style("stroke", "fff")
        .attr("d", generatePath);
    }

    /**
     * draws the greyscaled grid of hexagons by umatrix values
     */
    public drawUMatrix(umatrix: number[]) {
      this.hexagons
        .transition()
        .duration(700)
        .style(
          "fill",
          (_: any, i: number): string =>
            umatrix[i] ? interpolateGreys(umatrix[i]) : "#e0e0e0"
        );
    }

    /**
     * draws the heatmap grid of hexagons by specific variable
     */
    public drawHeatmap(variable: number) {
      this.hexagons
        .transition()
        .duration(700)
        .style(
          "fill",
          (d: Neuron, i: number): string =>
            d.v ? interpolateSpectral(d.v[variable]) : "#e0e0e0"
        );
    }

    public render(): JSX.Element {
      const { classes, title, heatmap } = this.props;
      const { fullWidth, fullHeight } = this.state;

      return (
        <div className={classes.root}>
          {title && (
            <Typography variant="body1" className={classes.title}>
              {title}
            </Typography>
          )}
          {heatmap && (
            <Typography variant="button" color="textSecondary" paragraph={true}>
              select variables component will be here
            </Typography>
          )}
          <div
            className={classes.svgContainer}
            style={{ paddingBottom: `${(fullHeight / fullWidth) * 100}%` }}
          >
            <svg className={classes.svg} ref={this.ref} />
          </div>
        </div>
      );
    }
  }
);
