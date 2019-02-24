import { createStyles, withStyles, WithStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { Neuron } from "@seracio/kohonen/dist/types";
import { range } from "d3-array";
import {
  forceCollide,
  forceSimulation,
  forceX,
  forceY,
  SimulationNodeDatum
} from "d3-force";
import { scaleBand, scaleLinear } from "d3-scale";
import { interpolateGreys, interpolateSpectral } from "d3-scale-chromatic";
import { event, select } from "d3-selection";
import "d3-selection-multi";
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
  },
  grid: {
    filter: "url(#glow)"
  },
  tooltip: {
    position: "absolute",
    zIndex: 10,
    visibility: "hidden",
    fontSize: 14,
    fontFamily: "Roboto, sans-serif"
  }
});

interface IPosition extends SimulationNodeDatum {
  name?: string;
}

interface IProps extends WithStyles<typeof styles> {
  title?: string;
  neurons: Neuron[];
  dimensions: IHexagonalGridDimensions;
  umatrix?: number[];
  positions?: number[][];
  heatmap?: boolean;
}

export const HexagonalGrid = withStyles(styles)(
  class extends Component<IProps, IChartState> {
    protected svgRef = createRef<SVGSVGElement>();
    protected svg: any;
    protected grid: any;
    protected hexagons: any;
    protected tooltip: any;
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

    public initSVG({ fullWidth, fullHeight, margin }: IChartState) {
      if (this.svgRef) {
        this.getSVG(this.svgRef);
        this.setSVGAttributes(fullWidth, fullHeight, margin);
      }
    }

    public componentDidMount() {
      const { neurons, dimensions, umatrix, heatmap, positions } = this.props;

      this.initSVG(this.state);
      this.drawGrid(dimensions, neurons);

      // draw only if the heatmap is enabled and neuron have weights (v property)
      if (has(head(neurons), "v") && heatmap) {
        this.drawHeatmap(0);
      }

      if (!isUndefined(umatrix) && !isEmpty(umatrix)) {
        this.drawUMatrix(umatrix as number[]);
      }

      if (!isUndefined(positions) && !isEmpty(positions)) {
        // NOTE: it's fake data, it must be dynamic
        const observations = [
          "Position 1",
          "Position 2",
          "Position 3",
          "Position 4",
          "Position 5",
          "Position 6",
          "Position 7",
          "Position 8"
        ];

        // NOTE: it's fake data, it must be dynamic
        const input = positions.map<IPosition>(([x, y], index) => ({
          index,
          x,
          y,
          name: observations[index]
        }));

        this.drawPositions(dimensions, input, observations);
        this.createTooltip();
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

    public componentWillUnmount() {
      this.removeTooltip();
    }

    public getSVG({ current }: RefObject<SVGSVGElement>) {
      this.svg = select(current);
    }

    public setSVGAttributes(width: number, height: number, margin: IMargin) {
      this.svg = this.svg
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    }

    public createTooltip() {
      const { classes } = this.props;

      this.tooltip = select("body")
        .append("div")
        .attr("class", classes.tooltip);
    }

    public removeTooltip() {
      if (!isUndefined(this.tooltip)) {
        this.tooltip.remove();
      }
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
      const { classes } = this.props;

      if (!isUndefined(this.grid)) {
        this.grid.remove();
      }

      this.computeHexagonRadius(hexagonSize);

      this.grid = this.svg.append("g").attrs({
        class: classes.grid,
        transform: `translate(${-hexagonSize / 2}, ${-hexagonSize +
          this.hexagonRadius})`
      });

      this.drawHexagons(hexagonSize, neurons);
    }

    /**
     * draws hexagons on the grid by neurons positions
     */
    public drawHexagons(hexagonSize: number, neurons: Neuron[]) {
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

    /**
     * draw positions of observations
     */
    public drawPositions(
      { hexagonSize }: IHexagonalGridDimensions,
      input: IPosition[],
      observations: string[]
    ) {
      const scaleColor = scaleBand()
        .domain(observations)
        .range([0, 1]);

      const getColor = (name: string) =>
        interpolateSpectral(scaleColor(name) as number);

      const getFill = ({ name }: IPosition) => getColor(name as string);

      const getX = ({ x }: IPosition) => {
        return this.scaleGrid(hexagonSize)(x as number);
      };

      const getY = ({ y }: IPosition) => {
        return this.scaleGrid(hexagonSize)(y as number);
      };

      forceSimulation(input)
        .force("x", forceX(getX))
        .force("y", forceY(getY))
        .force("collide", forceCollide(hexagonSize / 5))
        .on("tick", () => {
          const circles = this.grid.selectAll(".circle").data(input);

          circles
            .enter()
            .append("circle")
            .attrs({
              class: "circle",
              r: hexagonSize / 5
            })
            .styles({
              fill: getFill
            })
            .on("mouseover", ({ name }: IPosition) =>
              this.tooltip.html(name).styles({
                visibility: "visible"
              })
            )
            .on("mousemove", ({ name }: IPosition) => {
              let left = event.pageX + 10;

              const rect = this.tooltip.node().getBoundingClientRect();

              if (left + rect.width > window.innerWidth - 30) {
                left = event.pageX - rect.width - 10;
              }

              this.tooltip.html(name).styles({
                top: event.pageY - 10 + "px",
                left: left + "px"
              });
            })
            .on("mouseout", ({ name }: IPosition) =>
              this.tooltip.html(null).styles({
                visibility: "hidden",
                top: "0px",
                left: "0px"
              })
            )
            .merge(circles)
            .attrs({
              cx: ({ x }: IPosition): number => x as number,
              cy: ({ y }: IPosition): number => y as number
            });
        });
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
            <svg className={classes.svg} ref={this.svgRef}>
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            </svg>
          </div>
        </div>
      );
    }
  }
);
