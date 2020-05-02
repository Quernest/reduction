import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import * as d3 from "d3";
import {
  forceCollide,
  forceSimulation,
  Simulation,
  SimulationNodeDatum,
  forceX,
  forceY,
  forceCenter,
  forceManyBody
} from "d3-force";
import React from "react";
import compose from "recompose/compose";
import { IChartState, Points, Vectors } from "../../models";
import { SVG } from "../SVG";
import { withTranslation, WithTranslation } from 'react-i18next';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: "100%"
    },
    title: {
      marginTop: theme.spacing(2)
    },
    axis: {
      fontSize: theme.typography.fontSize,
      fontFamily: theme.typography.fontFamily
    },
    axisLabel: {
      fontSize: theme.typography.fontSize,
      fontFamily: theme.typography.fontFamily,
      textAnchor: "middle"
    },
    factor: {
      fontSize: theme.typography.fontSize,
      fontFamily: theme.typography.fontFamily,
      textAnchor: "middle"
    },
    vector: {
      stroke: "#000",
      strokeWidth: 1.5,
      markerEnd: "url(#arrow)"
    },
    point: {
      fill: "red"
    }
  });

interface IBiplotProps extends WithTranslation {
  theme: Theme;
  title?: string;
  points: Points;
  eigenvectors: Vectors;
  factors: string[];
  classes?: any;
  xAxisLabel: string;
  yAxisLabel: string;
}

interface IBiplotState extends IChartState {
  transform: {
    k: number;
    x: number;
    y: number;
  };
}

class BiplotBase extends React.Component<IBiplotProps, IBiplotState> {
  public static readonly defaultProps = {
    xAxisLabel: "x",
    yAxisLabel: "y"
  };

  public readonly state = {
    margin: {
      top: 45,
      right: 45,
      bottom: 60,
      left: 60
    },
    fullWidth: 1280,
    fullHeight: 740,
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

  protected svg: d3.Selection<d3.BaseType, any, HTMLElement, any>;

  /**
   * zoom listener
   */
  private zoom: d3.ZoomBehavior<Element, {}>;

  /**
   * clip-path (wrapper for view)
   */
  protected clip: d3.Selection<d3.BaseType, any, HTMLElement, any>;

  /**
   * group element for zooming
   * append here translating elements
   */
  protected view: d3.Selection<d3.BaseType, any, HTMLElement, any>;

  protected xScale: d3.ScaleLinear<number, number>;
  protected yScale: d3.ScaleLinear<number, number>;

  protected axisTop: d3.Axis<number | { valueOf(): number }>;
  protected axisBottom: d3.Axis<number | { valueOf(): number }>;
  protected axisLeft: d3.Axis<number | { valueOf(): number }>;
  protected axisRight: d3.Axis<number | { valueOf(): number }>;
  protected gAxisTop: d3.Selection<d3.BaseType, any, HTMLElement, any>;
  protected gAxisBottom: d3.Selection<d3.BaseType, any, HTMLElement, any>;
  protected gAxisLeft: d3.Selection<d3.BaseType, any, HTMLElement, any>;
  protected gAxisRight: d3.Selection<d3.BaseType, any, HTMLElement, any>;
  protected simulation: Simulation<SimulationNodeDatum, undefined>;

  public componentDidMount() {
    this.selectSVGElement();
    this.createDefs();
    this.drawAxes();
    this.drawPoints();
    this.drawVectors();
  }

  public componentDidUpdate(props: IBiplotProps) {
    if (
      this.props.xAxisLabel !== props.xAxisLabel ||
      this.props.yAxisLabel !== props.yAxisLabel
    ) {
      this.svg.select(`text#axis-x-label`).remove();
      this.svg.select(`text#axis-y-label`).remove();
      this.gAxisLeft.remove();
      this.gAxisTop.remove();
      this.gAxisRight.remove();
      this.gAxisBottom.remove();

      this.drawAxes();

      // update zoom
      this.svg.call(
        this.zoom.transform,
        d3.zoomIdentity
          .translate(this.state.transform.x, this.state.transform.y)
          .scale(this.state.transform.k)
      );
    }
  }

  public componentWillUnmount() {
    this.stopSimulation();
  }

  private onGetXScaleValue = (value: number): number => {
    const { k } = this.state.transform;

    return this.xScale(value * k);
  };

  private onGetYScaleValue = (value: number): number => {
    const { k } = this.state.transform;

    return this.yScale(value * k);
  };

  private timeout: NodeJS.Timeout;

  protected onZoom = () => {
    const { classes } = this.props;
    const { transform } = d3.event;

    const newX = transform.rescaleX(this.xScale);
    const newY = transform.rescaleY(this.yScale);

    this.setState({
      transform
    });

    this.view.attr("transform", transform);
    this.gAxisTop.call(this.axisTop.scale(newX));
    this.gAxisBottom.call(this.axisBottom.scale(newX));
    this.gAxisLeft.call(this.axisLeft.scale(newY));
    this.gAxisRight.call(this.axisRight.scale(newY));
    this.view.selectAll(`line.${classes.vector}`).remove();
    this.view.selectAll(`text.${classes.factor}`).remove();
    this.view.selectAll(`circle.${classes.point}`).remove();
    this.drawVectors();

    clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {
      this.drawPoints();
    }, 500);
  };

  public selectSVGElement() {
    const { margin } = this.state;

    this.zoom = d3
      .zoom<Element, {}>()
      .scaleExtent([1 / 2, 5])
      .on("zoom", this.onZoom);

    this.svg = d3
      .select("#biplot")
      .call(this.zoom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    this.clip = this.svg.append("g").attr("clip-path", "url(#clip)");
    this.view = this.clip.append("g").attr("pointer-events", "all");
  }

  public createDefs() {
    const { width, height } = this.state;
    const defs = this.svg.append("defs");
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

    defs
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);
  }

  public stopSimulation() {
    if (this.simulation) {
      this.simulation.stop();
    }
  }

  public drawAxes = () => {
    const {
      classes,
      points: [xPoints, yPoints]
    } = this.props;
    const { width, height } = this.state;

    const xMax = d3.max(xPoints) || 0;
    const yMax = d3.max(yPoints) || 0;

    this.xScale = d3
      .scaleLinear()
      .domain([-xMax, xMax])
      .rangeRound([0, width]);
    this.yScale = d3
      .scaleLinear()
      .domain([yMax, -yMax])
      .rangeRound([0, height]);
    this.axisLeft = d3.axisLeft(this.yScale);
    this.axisTop = d3.axisTop(this.xScale);
    this.axisRight = d3.axisRight(this.yScale);
    this.axisBottom = d3.axisBottom(this.xScale);
    this.gAxisLeft = this.svg
      .append("g")
      .attr("class", classes.axis)
      .attr("transform", `translate(0, 0)`)
      .call(this.axisLeft);
    this.gAxisTop = this.svg
      .append("g")
      .attr("class", classes.axis)
      .attr("transform", `translate(0, 0)`)
      .call(this.axisTop);
    this.gAxisRight = this.svg
      .append("g")
      .attr("class", classes.axis)
      .attr("transform", `translate(${width}, 0)`)
      .call(this.axisRight);
    this.gAxisBottom = this.svg
      .append("g")
      .attr("class", classes.axis)
      .attr("transform", `translate(0, ${height})`)
      .call(this.axisBottom);
    this.drawAxesLabels();
  };

  private drawAxesLabels(): void {
    const { classes, xAxisLabel, yAxisLabel } = this.props;
    const { width, height, margin } = this.state;

    this.svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom)
      .attr("dy", "-0.75em")
      .attr("class", classes.axisLabel)
      .attr("id", "axis-x-label")
      .text(xAxisLabel);

    this.svg
      .append("text")
      .attr("x", 0 - height / 2)
      .attr("y", 0 - margin.left)
      .attr("dy", "1em")
      .attr("class", classes.axisLabel)
      .attr("id", "axis-y-label")
      .attr("transform", "rotate(-90)")
      .text(yAxisLabel);
  }

  /**
   * draw points on 2d scatter
   */
  public drawPoints = () => {
    const {
      classes,
      points: [xPoints, yPoints]
    } = this.props;
    this.stopSimulation();

    const nodes: SimulationNodeDatum[] = [];

    xPoints.forEach((x, i) => {
      const y = yPoints[i];

      nodes.push({
        x: this.onGetXScaleValue(x),
        y: this.onGetYScaleValue(y),
        index: i
      });
    });

    const node = this.view
      .selectAll(`circle.${classes.point}`)
      .data(nodes)
      .enter()
      .append("circle")
      .attr("class", classes.point)
      .attr("r", 4)

    this.simulation = forceSimulation(nodes)
      .force('x', forceX((d: SimulationNodeDatum): number => d.x as number))
      .force('y', forceY((d: SimulationNodeDatum): number => d.y as number))
      .force("center", forceCenter(this.state.width / 2, this.state.height / 2))
      .force("collision", forceCollide(4))
      .force("charge", forceManyBody().strength(0.25))
      .on("tick", () => {
        node
          .attr("cx", (d: SimulationNodeDatum): number => d.x as number)
          .attr("cy", (d: SimulationNodeDatum): number => d.y as number)
      })
      .alphaTarget(0)
      .alphaDecay(0.05);
  };

  /**
   * draw eigenvectors (loadings)
   */
  public drawVectors = () => {
    const {
      classes,
      factors,
      eigenvectors: [x1Points, y1Points, x2Points, y2Points],
      theme
    } = this.props;

    this.view
      .selectAll(`line.${classes.vector}`)
      .data(x1Points)
      .enter()
      .append("line")
      .attr("class", classes.vector)
      .attr("x1", (_, i) => this.onGetXScaleValue(x1Points[i]))
      .attr("y1", (_, i) => this.onGetYScaleValue(y1Points[i]))
      .attr("x2", (_, i) => this.onGetXScaleValue(x2Points[i]))
      .attr("y2", (_, i) => this.onGetYScaleValue(y2Points[i]));

    this.view
      .selectAll(`text.${classes.factor}`)
      .data(x1Points)
      .enter()
      .append("text")
      .attr("class", classes.factor)
      .attr("transform", (_, i) => {
        /**
         * angle of current vector
         */
        const angle: number =
          (Math.atan2(
            this.onGetYScaleValue(y2Points[i]) -
            this.onGetYScaleValue(y1Points[i]),
            this.onGetXScaleValue(x2Points[i]) -
            this.onGetXScaleValue(x1Points[i])
          ) *
            180) /
          Math.PI;

        /**
         * distance from the end of arrow to the text (factor)
         */
        const dev: number =
          angle >= 0
            ? theme.typography.fontSize
            : -(theme.typography.fontSize / 2);

        return `translate(${this.onGetXScaleValue(
          x2Points[i]
        )},${this.onGetYScaleValue(y2Points[i]) + dev})`;
      })
      .text((_, i) => factors[i]);
  };

  public render() {
    const { classes, title, t } = this.props;
    const { fullWidth, fullHeight } = this.state;

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
        <Typography variant="body2" color="textSecondary">
          {t('biplot.info')}
        </Typography>
        <SVG id="biplot" width={fullWidth} height={fullHeight} />
      </div>
    );
  }
}

export const Biplot = compose<IBiplotProps, any>(
  withTranslation(),
  withStyles(styles, { withTheme: true })
)(BiplotBase);
