import { createStyles, withStyles, WithStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { Neuron } from "@seracio/kohonen/dist/types";
import { range } from "d3-array";
import { scaleLinear } from "d3-scale";
import { interpolateGreys } from "d3-scale-chromatic";
import { select } from "d3-selection";
import { line } from "d3-shape";
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
}

export const HexagonalGrid = withStyles(styles)(
  class extends Component<IProps, IChartState> {
    private ref = createRef<SVGSVGElement>();
    private ctx: any;
    private grid: any;
    private hexagonRadius: number = 0;

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

    public componentDidMount() {
      const { dimensions, neurons, umatrix } = this.props;
      const { fullWidth, fullHeight, margin } = this.state;

      this.getContext(this.ref);
      this.setContextAttributes(fullWidth, fullHeight, margin);
      this.drawGrid(dimensions, neurons);

      if (umatrix && umatrix.length > 0) {
        this.drawUMatrix(umatrix);
      }
    }

    public componentDidUpdate(props: IProps) {
      const { neurons, dimensions, umatrix } = this.props;

      if (
        props.neurons !== neurons ||
        props.dimensions !== dimensions ||
        props.umatrix !== umatrix
      ) {
        this.grid.remove();
        this.drawGrid(dimensions, neurons);

        if (umatrix && umatrix.length > 0) {
          this.drawUMatrix(umatrix);
        }
      }
    }

    private getContext({ current }: RefObject<SVGSVGElement>) {
      this.ctx = select(current);
    }

    private setContextAttributes(
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
    private scaleGrid(hexagonSize: number) {
      return scaleLinear()
        .domain([0, 1])
        .range([0, hexagonSize]);
    }

    /**
     * computes the radius of an hexagon
     */
    private computeHexagonRadius(hexagonSize: number) {
      this.hexagonRadius = hexagonSize / 2 / Math.cos(Math.PI / 6);
    }

    /**
     * generates points of an hexagon
     */
    private getHexagonPoints([x, y]: [number, number], hexagonRadius: number) {
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
    private drawGrid(
      { hexagonSize }: IHexagonalGridDimensions,
      neurons: Neuron[]
    ) {
      // compute radius first
      this.computeHexagonRadius(hexagonSize);

      // generate path of an hexagon
      const generatePath = ({ pos: [x, y] }: Neuron) => {
        const sX = this.scaleGrid(hexagonSize)(x);
        const sY = this.scaleGrid(hexagonSize)(y);

        const points = this.getHexagonPoints([sX, sY], this.hexagonRadius);

        return line()(points);
      };

      this.grid = this.ctx
        .append("g")
        .attr(
          "transform",
          `translate(${-hexagonSize / 2}, ${-hexagonSize + this.hexagonRadius})`
        );

      this.grid = this.grid
        .selectAll(".hexagon")
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
    private drawUMatrix(umatrix: number[]) {
      this.grid
        .transition()
        .duration(800)
        .style(
          "fill",
          (_: any, i: number): string =>
            umatrix[i] ? interpolateGreys(umatrix[i]) : "#e0e0e0"
        );
    }

    public render(): JSX.Element {
      const { classes, title } = this.props;
      const { fullWidth, fullHeight } = this.state;

      return (
        <div className={classes.root}>
          {title && (
            <Typography
              variant="body1"
              color="textSecondary"
              className={classes.title}
            >
              {title}
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
