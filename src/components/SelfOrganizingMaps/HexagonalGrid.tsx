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
import { scaleBand, scaleLinear } from "d3-scale";
import { interpolateGreys, interpolateSpectral } from "d3-scale-chromatic";
import { select, Selection } from "d3-selection";
import { line } from "d3-shape";
import React, { Component, createRef, RefObject } from "react";
import { IChartState, IHexagonalGridDimensions } from "src/models/chart.model";

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
}

export const HexagonalGrid = withStyles(styles)(
  class extends Component<IProps, IChartState> {
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
     * element for custom data-binding for lower canvas
     */
    protected lowerCustomBase = document.createElement("custom1");

    /**
     * selection for custom data-binding for lower canvas
     */
    protected lowerBase: Selection<HTMLElement, {}, null, undefined>;

    /**
     * element for custom data-binding for upper canvas
     */
    protected upperCustomBase = document.createElement("custom2");

    /**
     * selection for custom data-binding for upper canvas
     */
    protected upperBase: Selection<HTMLElement, {}, null, undefined>;

    /**
     * computed radius of hexagon
     */
    protected hexagonRadius: number;

    /**
     * force simulation
     */
    protected force: Simulation<IPosition, undefined>;

    /**
     * react component state
     */
    public readonly state = {
      margin: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
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

    /**
     * initialize lower canvas and it's context
     */
    public initLowerCanvas({ current }: RefObject<HTMLCanvasElement>) {
      if (current) {
        this.lowerCanvas = select(current);
        // @ts-ignore
        this.lowerCtx = this.lowerCanvas.node().getContext("2d");
      }
    }

    /**
     * initialize lower base for data-binding
     */
    public initLowerBase() {
      this.lowerBase = select(this.lowerCustomBase);
    }

    /**
     * initialize upper canvas and it's context
     */
    public initUpperCanvas({ current }: RefObject<HTMLCanvasElement>) {
      if (current) {
        this.upperCanvas = select(current);
        // @ts-ignore
        this.upperCtx = this.upperCanvas.node().getContext("2d");
      }
    }

    /**
     * initialize upper base for data-binding
     */
    public initUpperBase() {
      this.upperBase = select(this.upperCustomBase);
    }

    public componentDidMount() {
      const {
        dimensions: { columns, rows },
        neurons,
        heatmap,
        umatrix,
        positions
      } = this.props;
      const { fullWidth, fullHeight } = this.state;

      /**
       * incircle radius
       */
      const r = Math.round(max([
        fullWidth / (Math.sqrt(3) * columns + 3),
        fullHeight / ((rows + 3) * 1.5)
      ]) as number);

      /**
       * short diagonal
       */
      const d = (r as number) * 2;

      /**
       * long diagonal
       */
      const D = 2 * (d / Math.sqrt(3));

      /**
       * circumcircle radius
       */
      const R = Math.round(D / 2);

      /**
       * best canvas width calculation
       */
      const bestWidth = Math.round(columns * d + r / 2 + R / 2) + d;

      /**
       * best canvas height calculation
       */
      const bestHeight = Math.round(rows * (D - R / 2) + r / 2) + d;

      // console.group("hexagon dimensions");
      // console.log("best width:", bestWidth);
      // console.log("best height:", bestHeight);
      // console.log("r:", r);
      // console.log("R:", R);
      // console.log("d:", d);
      // console.log("D:", D);
      // console.groupEnd();

      // set the circumcircle radius
      this.hexagonRadius = R;

      this.setState(
        {
          fullWidth: bestWidth,
          fullHeight: bestHeight
        },
        () => {
          this.initLowerCanvas(this.lowerCanvasReference);
          this.initLowerBase();
          this.drawHexagons(d, R, neurons, heatmap, umatrix);

          if (positions && positions.length > 0) {
            this.initUpperCanvas(this.upperCanvasReference);
            this.initUpperBase();
            this.drawPositions(d, positions);
          }
        }
      );
    }

    public componentWillUnmount() {
      if (this.force) {
        this.force.stop();
      }

      if (this.lowerCustomBase) {
        this.lowerCustomBase.remove();
      }

      if (this.lowerBase) {
        this.lowerBase.remove();
      }

      if (this.upperCustomBase) {
        this.lowerCustomBase.remove();
      }

      if (this.upperBase) {
        this.lowerBase.remove();
      }
    }

    /**
     * hexagonData are normalized such as 2 neighbors have a distance of 1
     * scale them to have this distance
     * @param d short diagonal of the hexagon
     */
    public scaleGrid(d: number) {
      return scaleLinear()
        .domain([0, 1])
        .range([0, d]);
    }

    /**
     * generates points of an hexagon
     * @param [x, y] is a pos of neuron
     * @param R circumcircle radius of the hexagon
     */
    public getHexagonPoints([x, y]: [number, number], R: number) {
      return range(-Math.PI / 2, 2 * Math.PI, (2 * Math.PI) / 6).map<
        [number, number]
      >((a: number) => [x + Math.cos(a) * R, y + Math.sin(a) * R]);
    }

    /**
     * draw grid of hexagons and optional heatmap or umatrix
     * @param d short diagonal of the hexagon
     * @param R circumcircle radius of the hexagon
     * @param neurons collection of neurons
     * @param heatmap if true hexagons map will be filled in color by weight value
     * @param umatrix array of neighbour distances (numbers)
     */
    public drawHexagons(
      d: number,
      R: number,
      neurons: Neuron[],
      heatmap?: boolean,
      umatrix?: number[]
    ) {
      const generatePath = ({ pos: [x, y] }: Neuron) => {
        const sX = this.scaleGrid(d)(x);
        const sY = this.scaleGrid(d)(y);

        const points = this.getHexagonPoints([sX, sY], R);

        return line()(points);
      };

      const hexagons = this.lowerBase
        .selectAll(".hexagon")
        .data(neurons)
        .enter()
        .append("path")
        .attr("d", generatePath);

      hexagons.each(({ v }: Neuron, i: number, nodes: SVGPathElement[]) => {
        const node = select(nodes[i]) as Selection<
          SVGPathElement,
          {},
          null,
          undefined
        >;

        // parse D path from hexagon attribute
        const path = new Path2D(node.attr("d"));

        this.lowerCtx.beginPath();

        // todo: make a separate methods?
        if (v && heatmap) {
          this.lowerCtx.fillStyle = interpolateSpectral(v[1]);
        } else if (umatrix) {
          this.lowerCtx.fillStyle = interpolateGreys(umatrix[i]);
        } else {
          this.lowerCtx.fillStyle = "#e0e0e0";
        }

        this.lowerCtx.strokeStyle = "#bbb";
        this.lowerCtx.stroke(path);
        this.lowerCtx.fill(path);
        this.lowerCtx.closePath();
      });

      hexagons.exit().remove();
    }

    /**
     * draw positions of observations
     * @param d short diagonal of the hexagon
     * @param positions result from the SOM mapping process, array of arrays with x and y positions
     */
    public drawPositions(d: number, positions: number[][]) {
      const { fullWidth, fullHeight } = this.state;

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

      const scaleColor = scaleBand()
        .domain(observations)
        .range([0, 1]);

      const getColor = (name: string) =>
        interpolateSpectral(scaleColor(name) as number);

      const getX = ({ x }: IPosition) => {
        return this.scaleGrid(d)(x as number);
      };

      const getY = ({ y }: IPosition) => {
        return this.scaleGrid(d)(y as number);
      };

      const circles = this.upperBase
        .selectAll(".circle")
        .data(input)
        .enter()
        .append("circle");

      const circleRadius: number = d / 6;

      // physics simulation
      this.force = forceSimulation(input)
        .force("x", forceX(getX))
        .force("y", forceY(getY))
        .force("collide", forceCollide(circleRadius))
        .on("tick", () => {
          this.upperCtx.clearRect(0, 0, fullWidth, fullHeight);

          circles.each(({ x, y, name }: IPosition, i: number) => {
            this.upperCtx.beginPath();
            this.upperCtx.fillStyle = getColor(name as string);
            this.upperCtx.arc(
              x as number,
              y as number,
              circleRadius,
              0,
              2 * Math.PI
            );
            this.upperCtx.fill();
            this.upperCtx.closePath();
          });
        });

      circles.exit().remove();
    }

    public render(): JSX.Element {
      const { classes, title, positions } = this.props;
      const { fullWidth, fullHeight } = this.state;

      return (
        <div className={classes.root}>
          {title && (
            <Typography variant="body1" className={classes.title}>
              {title}
            </Typography>
          )}
          <div
            className={classes.container}
            style={{ paddingBottom: `${(fullHeight / fullWidth) * 100}%` }}
          >
            <canvas
              width={fullWidth}
              height={fullHeight}
              className={classes.canvas}
              ref={this.lowerCanvasReference}
            />
            {positions && (
              <canvas
                width={fullWidth}
                height={fullHeight}
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
