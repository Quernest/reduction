import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { Neuron } from "@seracio/kohonen/dist/types";
import { mean } from "d3-array";
import {
  forceCollide,
  forceSimulation,
  forceX,
  forceY,
  Simulation,
  SimulationNodeDatum
} from "d3-force";
import { scaleBand, scaleLinear } from "d3-scale";
import {
  interpolateBlues,
  interpolateGreys,
  interpolateSpectral
} from "d3-scale-chromatic";
import { event, select, Selection } from "d3-selection";
import { line } from "d3-shape";
import forEach from "lodash/forEach";
import isUndefined from "lodash/isUndefined";
import map from "lodash/map";
import reduce from "lodash/reduce";
import React, { Component } from "react";
import { IHexagonalGridDimensions } from "../../models";
import { Hexagon } from ".";

const styles = ({ typography, spacing }: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      marginBottom: spacing.unit * 3
    },
    title: {
      marginTop: spacing.unit * 2
    },
    container: {
      position: "relative"
    },
    canvas: {
      position: "absolute",
      top: 0,
      left: 0,
      padding: 0,
      margin: 0,
      width: "100%",
      height: "auto",
      border: "1px solid #eee"
    },
    tooltip: {
      position: "absolute",
      top: 0,
      left: 0,
      fontSize: typography.fontSize,
      fontFamily: typography.fontFamily,
      userSelect: "none",
      pointerEvents: "none",
      whiteSpace: "nowrap",
      color: "#fff",
      zIndex: 10,
      opacity: 0,
      textShadow:
        "1px 1px 0 rgba(0,0,0,0.5), 1px -1px 0 rgba(0,0,0,0.5), -1px 1px 0 rgba(0,0,0,0.5), -1px -1px 0 rgba(0,0,0,0.5), 1px 0px 0 rgba(0,0,0,0.5), 0px 1px 0 rgba(0,0,0,0.5), -1px 0px 0 rgba(0,0,0,0.5), 0px -1px 0 rgba(0,0,0,0.5)"
    }
  });

interface IPosition extends SimulationNodeDatum {
  name?: string;
  type?: string;
}

interface IHexagonalGridProps extends WithStyles {
  title?: string;
  neurons: Neuron[];
  dimensions: IHexagonalGridDimensions;
  heatmap?: boolean;
  umatrix?: number[];
  positions?: number[][];
  observations?: string[];
  factors?: string[];
  types?: string[];
  currentFactorIdx?: number;
}

interface IHexagonalGridState {
  width: number;
  height: number;
  hexagon: Hexagon;
}

class HexagonalGridBase extends Component<
  IHexagonalGridProps,
  IHexagonalGridState
> {
  protected lowerCanvasReference = React.createRef<HTMLCanvasElement>();
  protected upperCanvasReference = React.createRef<HTMLCanvasElement>();
  protected lowerCanvas: Selection<HTMLCanvasElement, {}, null, undefined>;
  protected upperCanvas: Selection<HTMLCanvasElement, {}, null, undefined>;
  protected lowerCtx: CanvasRenderingContext2D;
  protected upperCtx: CanvasRenderingContext2D;
  protected simulation: Simulation<IPosition, undefined>;
  protected tooltip: Selection<HTMLDivElement, {}, HTMLElement, any>;

  public readonly state: IHexagonalGridState = {
    width: 1280,
    height: 560,
    get hexagon() {
      return new Hexagon(this.width, this.height, 0, 0);
    }
  };

  public componentDidMount() {
    this.init();
  }

  public componentDidUpdate(prevProps: IHexagonalGridProps) {
    if (prevProps.currentFactorIdx !== this.props.currentFactorIdx) {
      this.clearCtxRect(this.lowerCtx);
      this.drawHexagons();
    }
  }

  public componentWillUnmount() {
    this.stopSimulation();
    this.removeTooltip();
  }

  public init() {
    const { width, height } = this.state;
    const {
      positions,
      observations,
      types,
      dimensions: { columns, rows }
    } = this.props;

    const hexagon = new Hexagon(width, height, columns, rows);

    const bestWidth =
      Math.round(
        columns * hexagon.shortDiagonal +
          hexagon.incircleRadius / 2 +
          hexagon.circumcircleRadius / 2
      ) + hexagon.shortDiagonal;

    const bestHeight =
      Math.round(
        rows * (hexagon.longDiagonal - hexagon.circumcircleRadius / 2) +
          hexagon.incircleRadius / 2
      ) + hexagon.shortDiagonal;

    this.setState(
      {
        hexagon,
        width: bestWidth,
        height: bestHeight
      },
      () => {
        this.initLowerCanvas(this.lowerCanvasReference);
        this.drawHexagons();

        if (!isUndefined(positions) && !isUndefined(observations)) {
          this.createTooltip();
          this.initUpperCanvas(this.upperCanvasReference);
          this.drawPositions(positions, observations, types);
        }
      }
    );
  }

  public initLowerCanvas({ current }: React.RefObject<HTMLCanvasElement>) {
    if (current) {
      this.lowerCanvas = select(current);
      const node = this.lowerCanvas.node();

      if (node) {
        this.lowerCtx = node.getContext("2d") as CanvasRenderingContext2D;
      }
    }
  }

  public initUpperCanvas({ current }: React.RefObject<HTMLCanvasElement>) {
    if (current) {
      this.upperCanvas = select(current);
      const node = this.upperCanvas.node();

      if (node) {
        this.upperCtx = node.getContext("2d") as CanvasRenderingContext2D;
      }
    }
  }

  public createTooltip() {
    const { classes } = this.props;

    this.tooltip = select("body")
      .append("div")
      .attr("class", classes.tooltip);
  }

  public stopSimulation() {
    if (this.simulation) {
      this.simulation.stop();
    }
  }

  public removeTooltip() {
    if (this.tooltip) {
      this.tooltip.remove();
    }
  }

  public clearCtxRect(ctx: CanvasRenderingContext2D) {
    const { width, height } = this.state;

    ctx.clearRect(0, 0, width, height);
  }

  /**
   * hexagonData are normalized such as 2 neighbors have a distance of 1
   * scale them to have this distance
   * @param value - scaled value
   */
  public scaleGrid(value: number) {
    const { hexagon } = this.state;

    return scaleLinear()
      .domain([0, 1])
      .range([0, hexagon.shortDiagonal])(value);
  }

  /**
   * draw grid of hexagons and optional heatmap or umatrix
   */
  public drawHexagons() {
    const { currentFactorIdx, neurons, heatmap, umatrix } = this.props;
    const { hexagon } = this.state;

    const generatePathLine = ([x, y]: [number, number]) => {
      const sX = this.scaleGrid(x);
      const sY = this.scaleGrid(y);

      const points = hexagon.getPoints([sX, sY], hexagon.circumcircleRadius);

      return line()(points);
    };

    forEach(neurons, ({ pos, v }: Neuron, i: number) => {
      const pathLine = generatePathLine(pos);

      if (!pathLine) {
        return;
      }

      const path = new Path2D(pathLine);

      this.lowerCtx.beginPath();

      if (v && heatmap && !isUndefined(currentFactorIdx)) {
        this.lowerCtx.fillStyle = interpolateBlues(v[currentFactorIdx]);
      } else if (umatrix) {
        this.lowerCtx.fillStyle = interpolateGreys(umatrix[i]);
      } else {
        this.lowerCtx.fillStyle = "#e0e0e0";
      }

      this.lowerCtx.strokeStyle = "#8395a7";
      this.lowerCtx.stroke(path);
      this.lowerCtx.fill(path);
      this.lowerCtx.closePath();
    });
  }

  public drawPositions(
    positions: number[][],
    observations: string[],
    types?: string[]
  ) {
    const { hexagon } = this.state;

    const input = map<number[], IPosition>(positions, ([x, y], index) => ({
      index,
      x,
      y,
      name: observations[index],
      type: types ? types[index] : undefined
    }));

    const means = map(positions, pos => mean(pos));
    const maxMean = reduce(
      means,
      (a, b) => (!isUndefined(b) ? Math.max(a, b) : 0),
      0
    );

    // classify by type (add type to input and pass as param)
    const scaleColor = scaleBand();

    /**
     * positions represented in the interval from 0 to 1
     */
    const posInterval = map(means, x => (!isUndefined(x) ? x / maxMean : 0));

    if (types) {
      scaleColor.domain(types).range([0, 1]);
    }

    const getColor = (type: string) =>
      interpolateSpectral(scaleColor(type) as number);

    const getX = ({ x }: IPosition) => {
      return this.scaleGrid(x as number);
    };

    const getY = ({ y }: IPosition) => {
      return this.scaleGrid(y as number);
    };

    const circleRadius: number = hexagon.shortDiagonal / 5;

    // force simulation and draw positions (circles)
    this.simulation = forceSimulation(input)
      .force("x", forceX(getX))
      .force("y", forceY(getY))
      .force("collide", forceCollide(circleRadius))
      .on("tick", () => {
        this.clearCtxRect(this.upperCtx);

        input.forEach(({ x, y, type }: IPosition, i) => {
          if (!x || !y) {
            return;
          }

          this.upperCtx.beginPath();
          this.upperCtx.fillStyle = type
            ? getColor(type)
            : interpolateSpectral(posInterval[i]);
          this.upperCtx.arc(x, y, circleRadius, 0, 2 * Math.PI);
          this.upperCtx.strokeStyle = "#8395a7";
          this.upperCtx.stroke();
          this.upperCtx.fill();
          this.upperCtx.closePath();
        });
      });

    const tooltip = this.tooltip.node();
    const canvas = this.upperCanvas.node();

    if (tooltip && canvas) {
      /**
       * offset from cursor to the text
       */
      const offset = 10;

      this.upperCanvas.on("mousemove", () => {
        const canvasRect = canvas.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const scaleX = canvas.width / canvasRect.width;
        const scaleY = canvas.height / canvasRect.height;
        const x = (event.clientX - canvasRect.left) * scaleX;
        const y = (event.clientY - canvasRect.top) * scaleY;

        /**
         * closest node to the position ⟨x,y⟩ with the given search radius.
         */
        const node = this.simulation.find(x, y, circleRadius);

        if (node && node.name) {
          const { name, type } = node;

          const tooltipText = type ? `${name}, type: ${type}` : name;
          this.tooltip.text(tooltipText);

          // because tooltip initializes with width = 0
          if (tooltipRect.width) {
            /**
             * if true that means that the text
             * climbs abroad canvas and we need
             * to shift the text to the
             * left side of the cursor
             */
            const climbs =
              canvasRect.width * scaleX - x <=
              (tooltipRect.width + offset) * scaleX;

            this.tooltip.style("opacity", 1);
            this.tooltip.style("top", `${event.pageY - offset}px`);
            this.tooltip.style(
              "left",
              climbs
                ? `${event.pageX - tooltipRect.width - offset}px`
                : `${event.pageX + offset}px`
            );
          }
        } else {
          this.tooltip.text(null).style("opacity", 0);
        }
      });
    }
  }

  public render(): JSX.Element {
    const { classes, title, positions } = this.props;
    const { width, height } = this.state;

    return (
      <div className={classes.root}>
        {title && (
          <Typography
            variant="h2"
            gutterBottom={true}
            className={classes.title}
          >
            {title}
          </Typography>
        )}
        <div
          className={classes.container}
          style={{ paddingBottom: `${(height / width) * 100}%` }}
        >
          <canvas
            id="lowerCanvas"
            width={width}
            height={height}
            className={classes.canvas}
            ref={this.lowerCanvasReference}
          />
          {positions && (
            <canvas
              id="upperCanvas"
              width={width}
              height={height}
              className={classes.canvas}
              ref={this.upperCanvasReference}
            />
          )}
        </div>
      </div>
    );
  }
}

export const HexagonalGrid = withStyles(styles)(HexagonalGridBase);
