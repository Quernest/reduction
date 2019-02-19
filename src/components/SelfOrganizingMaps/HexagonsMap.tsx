import { createStyles, withStyles, WithStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Neuron } from "@seracio/kohonen/dist/types";
import { range } from "d3-array";
import { scaleLinear } from "d3-scale";
import { select, Selection } from "d3-selection";
import { line } from "d3-shape";
import flow from "lodash/fp/flow";
import get from "lodash/fp/get";
import map from "lodash/fp/map";
import React, { Component } from "react";
import { IChart } from "src/models/chart.model";
import { ITrainingConfig } from "src/models/som.model";

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

export interface IDimensions {
  columns: number;
  rows: number;
  hexagonSize: number;
}

interface IProps extends WithStyles<typeof styles> {
  title?: string;
  neurons: Neuron[];
  dimensions: IDimensions;
  trainingConfig: ITrainingConfig;
}

export const HexagonsMap = withStyles(styles)(
  class extends Component<IProps, IChart> {
    private svg: Selection<d3.BaseType, any, HTMLElement, any>;
    private gHexagons: Selection<d3.BaseType, any, HTMLElement, any>;

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
      const { neurons } = this.props;

      this.selectSVGElement();
      this.drawHexagons(neurons);
    }

    public componentDidUpdate(props: IProps) {
      const { neurons, dimensions } = this.props;

      if (props.neurons !== neurons || props.dimensions !== dimensions) {
        this.gHexagons.remove();
        this.drawHexagons(neurons);
      }
    }

    private selectSVGElement(): void {
      const { margin, fullWidth, fullHeight } = this.state;

      this.svg = select("#som")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${fullWidth} ${fullHeight}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    }

    private drawHexagons(neurons: Neuron[]): void {
      const { hexagonSize } = this.props.dimensions;

      // compute the radius of an hexagon
      const radius = hexagonSize / 2 / Math.cos(Math.PI / 6);

      // generate points of an hexagon
      const getHexagonPoints = ([x, y]: [number, number]) => {
        return range(-Math.PI / 2, 2 * Math.PI, (2 * Math.PI) / 6).map(
          (a: number) => [x + Math.cos(a) * radius, y + Math.sin(a) * radius]
        );
      };

      // hexagonData are normalized such as 2 neighbors have a distance of 1
      // scale them to have this distance equal to 50
      const scaleGrid = scaleLinear()
        .domain([0, 1])
        .range([0, hexagonSize]);

      // generate path of an hexagon
      const pathGen = flow<
        { pos: [number, number] },
        [number, number],
        number[],
        number[][],
        any
      >(
        get("pos"),
        map(scaleGrid),
        getHexagonPoints,
        line()
      );

      this.gHexagons = this.svg
        .append("g")
        .attr(
          "transform",
          `translate(${-hexagonSize / 2}, ${-hexagonSize + radius})`
        )
        .attr("class", "hexagons");

      this.gHexagons
        .selectAll(".hexagon")
        .data(neurons)
        .enter()
        .append("path")
        .style("fill", "#E0E0E0")
        .style("stroke", "fff")
        .attr("d", pathGen);
    }

    public render(): React.ReactNode {
      const { classes, title } = this.props;
      const { fullWidth, fullHeight } = this.state;

      return (
        <div className={classes.root}>
          <Typography
            variant="body1"
            color="textSecondary"
            className={classes.title}
          >
            {title}
          </Typography>
          <div
            className={classes.svgContainer}
            style={{ paddingBottom: `${(fullHeight / fullWidth) * 100}%` }}
          >
            <svg className={classes.svg} id="som" />
          </div>
        </div>
      );
    }
  }
);
