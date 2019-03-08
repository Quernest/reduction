import { createStyles, withStyles, WithStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { Neuron } from "@seracio/kohonen/dist/types";
import { max, range } from "d3-array";
import {
  forceCollide,
  forceSimulation,
  forceX,
  forceY,
  Simulation,
  SimulationNodeDatum
} from "d3-force";
import { scaleLinear } from "d3-scale";
import {
  interpolateBlues,
  interpolateGreys,
  interpolateSpectral
} from "d3-scale-chromatic";
import { event, select, Selection } from "d3-selection";
import "d3-selection-multi";
import { line } from "d3-shape";
import forEach from "lodash/forEach";
import isUndefined from "lodash/isUndefined";
import map from "lodash/map";
import * as math from "mathjs";
import React, { Component, createRef, RefObject } from "react";
import { IHexagonalGridDimensions, IHexagonParameters } from "src/models";

const styles = createStyles({
  root: {
    flexGrow: 1
  },
  title: {
    marginTop: 16,
    marginBottom: 8
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
    fontSize: 16,
    fontFamily: "Roboto, sans-serif",
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
}

interface IProps extends WithStyles {
  title?: string;
  neurons: Neuron[];
  dimensions: IHexagonalGridDimensions;
  heatmap?: boolean;
  umatrix?: number[];
  positions?: number[][];
  observations?: string[];
  variables?: string[];
  currentVariableIndex?: number;
}

interface IState {
  width: number;
  height: number;
  hexagonParameters: IHexagonParameters;
}

export const HexagonalGrid = withStyles(styles)(
  class extends Component<IProps, IState> {
    /**
     * react reference object with lower canvas layer element
     */
    protected lowerCanvasReference = createRef<HTMLCanvasElement>();

    /**
     * react reference object with upper canvas layer element
     */
    protected upperCanvasReference = createRef<HTMLCanvasElement>();

    /**
     * lower canvas selection
     */
    protected lowerCanvas: Selection<HTMLCanvasElement, {}, null, undefined>;

    /**
     * upper canvas selection
     */
    protected upperCanvas: Selection<HTMLCanvasElement, {}, null, undefined>;

    /**
     * 2d context of lower canvas
     */
    protected lowerCtx: CanvasRenderingContext2D;

    /**
     * 2d context of upper canvas
     */
    protected upperCtx: CanvasRenderingContext2D;

    /**
     * physics simulation
     */
    protected simulation: Simulation<IPosition, undefined>;

    /**
     * tooltip container
     */
    protected tooltip: Selection<HTMLDivElement, {}, HTMLElement, any>;

    /**
     * react component state
     */
    public readonly state = {
      width: 1280,
      height: 560,
      hexagonParameters: {
        r: 0,
        R: 0,
        d: 0,
        D: 0,
        a: 0
      }
    };

    public componentDidMount() {
      const { positions, observations } = this.props;
      const { columns, rows } = this.props.dimensions;
      const { r, R, d, D } = this.computeHexagonParameters();

      this.setState(
        {
          width: Math.round(columns * d + r / 2 + R / 2) + d,
          height: Math.round(rows * (D - R / 2) + r / 2) + d
        },
        () => {
          this.initLowerCanvas(this.lowerCanvasReference);
          this.drawHexagons();

          if (!isUndefined(positions) && !isUndefined(observations)) {
            this.createTooltip();
            this.initUpperCanvas(this.upperCanvasReference);
            this.drawPositions(positions, observations);
          }
        }
      );
    }

    public componentDidUpdate(prevProps: IProps, prevState: IState) {
      if (prevProps.currentVariableIndex !== this.props.currentVariableIndex) {
        this.clearCtxRect(this.lowerCtx);
        this.drawHexagons();
      }
    }

    public componentWillUnmount() {
      this.stopSimulation();
      this.removeTooltip();
    }

    public stopSimulation() {
      if (this.simulation) {
        this.simulation.stop();
      }
    }

    /**
     * initialize lower canvas and it's context
     */
    public initLowerCanvas({ current }: RefObject<HTMLCanvasElement>) {
      if (current) {
        this.lowerCanvas = select(current);
        const node = this.lowerCanvas.node();

        if (node) {
          this.lowerCtx = node.getContext("2d") as CanvasRenderingContext2D;
        }
      }
    }

    /**
     * initialize upper canvas and it's context
     */
    public initUpperCanvas({ current }: RefObject<HTMLCanvasElement>) {
      if (current) {
        this.upperCanvas = select(current);
        const node = this.upperCanvas.node();

        if (node) {
          this.upperCtx = node.getContext("2d") as CanvasRenderingContext2D;
        }
      }
    }

    /**
     * computes hexagon parameters as radius, diagonal, edge etc...
     */
    public computeHexagonParameters(): IHexagonParameters {
      const { width, height } = this.state;
      const { rows, columns } = this.props.dimensions;
      const r = max([
        width / (Math.sqrt(3) * columns + 3),
        height / ((rows + 3) * 1.5)
      ]) as number;
      const d = r * 2;
      const D = 2 * (d / Math.sqrt(3));
      const R = D / 2;
      const a = R;

      const hexagonParameters: IHexagonParameters = {
        r,
        R,
        d,
        D,
        a
      };

      this.setState({
        hexagonParameters: {
          ...this.state.hexagonParameters,
          ...hexagonParameters
        }
      });

      return hexagonParameters;
    }

    public createTooltip() {
      const { classes } = this.props;

      this.tooltip = select("body")
        .append("div")
        .attr("class", classes.tooltip);
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
      const { d } = this.state.hexagonParameters;

      return scaleLinear()
        .domain([0, 1])
        .range([0, d])(value);
    }

    /**
     * generates points of an hexagon
     * @param [x, y] is a pos of neuron
     */
    public getHexagonPoints([x, y]: [number, number]) {
      const { R } = this.state.hexagonParameters;

      return range(-Math.PI / 2, 2 * Math.PI, (2 * Math.PI) / 6).map<
        [number, number]
      >((a: number) => [x + Math.cos(a) * R, y + Math.sin(a) * R]);
    }

    /**
     * draw grid of hexagons and optional heatmap or umatrix
     */
    public drawHexagons() {
      const { currentVariableIndex, neurons, heatmap, umatrix } = this.props;

      const generatePathLine = ([x, y]: [number, number]) => {
        const sX = this.scaleGrid(x);
        const sY = this.scaleGrid(y);

        const points = this.getHexagonPoints([sX, sY]);

        return line()(points);
      };

      forEach(neurons, ({ pos, v }: Neuron, i: number) => {
        const pathLine = generatePathLine(pos);

        if (!pathLine) {
          return;
        }

        const path = new Path2D(pathLine);

        this.lowerCtx.beginPath();

        if (v && heatmap && !isUndefined(currentVariableIndex)) {
          this.lowerCtx.fillStyle = interpolateBlues(v[currentVariableIndex]);
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

    /**
     * draw positions of observations
     * @param d short diagonal of the hexagon
     * @param positions result from the SOM mapping process, array of arrays with x and y positions
     * @param observations array of observations
     */
    public drawPositions(positions: number[][], observations: string[]) {
      const { d } = this.state.hexagonParameters;

      const input = positions.map<IPosition>(([x, y], index) => ({
        index,
        x,
        y,
        name: observations[index]
      }));

      /**
       * mean of each position
       */
      const means: number[] = map(positions, pos => math.mean(pos));

      /**
       * max value of means array
       */
      const maxMean: number = math.max(means);

      /**
       * positions represented in the interval from 0 to 1
       */
      const posInterval = map(means, mean => mean / maxMean);

      // classify by type (add type to input and pass as param)
      // const scaleColor = scaleBand()
      //   .domain(observations)
      //   .range([0, 1]);

      // const getColor = (name: string) =>
      //   interpolateSpectral(scaleColor(name) as number);

      const getX = ({ x }: IPosition) => {
        return this.scaleGrid(x as number);
      };

      const getY = ({ y }: IPosition) => {
        return this.scaleGrid(y as number);
      };

      /**
       * radius of circle
       */
      const r: number = d / 5;

      // force simulation and draw positions (circles)
      this.simulation = forceSimulation(input)
        .force("x", forceX(getX))
        .force("y", forceY(getY))
        .force("collide", forceCollide(r))
        .on("tick", () => {
          this.clearCtxRect(this.upperCtx);

          input.forEach(({ x, y }: IPosition, i) => {
            if (!x || !y) {
              return;
            }

            this.upperCtx.beginPath();
            this.upperCtx.fillStyle = interpolateSpectral(posInterval[i]);
            this.upperCtx.arc(x, y, r, 0, 2 * Math.PI);
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
          /**
           * size of the canvas element and its position relative to the viewport
           */
          const canvasRect = canvas.getBoundingClientRect();

          /**
           * size of the tooltip div element and its position relative to the viewport
           */
          const tooltipRect = tooltip.getBoundingClientRect();

          /**
           * x scaling coefficient
           */
          const scaleX = canvas.width / canvasRect.width;

          /**
           * y scaling coefficient
           */
          const scaleY = canvas.height / canvasRect.height;

          /**
           * cursor position in canvas (multiplied by scaleY)
           */
          const x = (event.clientX - canvasRect.left) * scaleX;

          /**
           * cursor position in canvas (multiplied by scaleY)
           */
          const y = (event.clientY - canvasRect.top) * scaleY;

          /**
           * closest node to the position ⟨x,y⟩ with the given search radius.
           */
          const node = this.simulation.find(x, y, r);

          // if node is not undefined and has name
          if (node && node.name) {
            const { name } = node;

            // add text
            this.tooltip.text(name);

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

              this.tooltip.styles({
                opacity: 1,
                top: `${event.pageY - offset}px`,
                left: climbs
                  ? `${event.pageX - tooltipRect.width - offset}px`
                  : `${event.pageX + offset}px`
              });
            }
          } else {
            this.tooltip.text(null).styles({
              opacity: 0
            });
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
            <Typography variant="body1" className={classes.title}>
              {title}
            </Typography>
          )}
          <div
            className={classes.container}
            style={{ paddingBottom: `${(height / width) * 100}%` }}
          >
            <canvas
              width={width}
              height={height}
              className={classes.canvas}
              ref={this.lowerCanvasReference}
            />
            {positions && (
              <canvas
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
);
