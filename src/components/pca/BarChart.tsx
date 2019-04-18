import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import * as d3 from "d3";
import round from "lodash/round";
import React from "react";
import compose from "recompose/compose";
import { IBarData, IChartState } from "../../models";

const styles = ({ palette, spacing, typography, breakpoints }: Theme) =>
  createStyles({
    root: {
      width: "100%"
    },
    title: {
      marginTop: spacing.unit * 2,
      [breakpoints.down("sm")]: {
        fontSize: 16
      }
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
    axis: {
      fontSize: typography.fontSize,
      fontFamily: typography.fontFamily
    },
    axisLabel: {
      fontSize: typography.fontSize,
      fontFamily: typography.fontFamily
    },
    bar: {
      fill: palette.primary.main
    },
    barValue: {
      fontSize: typography.fontSize,
      fontFamily: typography.fontFamily
    },
    line: {
      fill: "none",
      stroke: "red",
      strokeWidth: 3,
      strokeLinejoin: "round",
      strokeLinecap: "round"
    },
    dot: {
      fill: "red"
    },
    label: {
      textAnchor: "start",
      fontSize: typography.fontSize,
      fontFamily: typography.fontFamily
    }
  });

interface IBarChartProps extends WithStyles<typeof styles> {
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  data: IBarData[];
}

class BarChartBase extends React.Component<IBarChartProps, IChartState> {
  /**
   * main svg element
   */
  protected svg: d3.Selection<d3.BaseType, any, HTMLElement, any>;

  /**
   * x axis
   */
  protected x: d3.ScaleBand<string>;

  /**
   * y axis
   */
  protected y: d3.ScaleLinear<number, number>;

  public readonly state = {
    margin: {
      top: 45,
      right: 45,
      bottom: 60,
      left: 60
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

  private onScaleName = ({ name }: IBarData): number => {
    return this.x(name) || 0;
  };

  private onScaleValue = ({ value }: IBarData): number => {
    return this.y(value) || 0;
  };

  public componentDidMount() {
    this.selectSVGElement();
    this.drawAxes();
    this.drawBars();
  }

  public selectSVGElement() {
    const { margin, fullWidth, fullHeight } = this.state;

    this.svg = d3
      .select("#bar")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${fullWidth} ${fullHeight}`)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  }

  public drawAxes() {
    const { classes, xAxisLabel, yAxisLabel, data } = this.props;
    const { width, height, margin } = this.state;

    this.x = d3
      .scaleBand()
      .range([0, width])
      .padding(0.25)
      .domain(data.map(d => d.name));
    this.y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, d => d.value) || 0]);
    this.svg
      .append("g")
      .attr("class", classes.axis)
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(this.x));
    this.svg
      .append("g")
      .attr("class", classes.axis)
      .call(d3.axisLeft(this.y));
    this.svg
      .append("text")
      .text(yAxisLabel || "Variances")
      .attr("transform", "rotate(-90)")
      .attr("x", 0 - height / 2)
      .attr("y", 0 - margin.left)
      .attr("dy", "1em")
      .attr("class", classes.axisLabel)
      .style("text-anchor", "middle");
    this.svg
      .append("text")
      .text(xAxisLabel || "Components")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom)
      .attr("dy", "-0.5em")
      .attr("class", classes.axisLabel)
      .style("text-anchor", "middle");
  }

  public drawBars = () => {
    const { classes, data } = this.props;
    const { width, height } = this.state;

    this.svg
      .selectAll(classes.bar)
      .data(data)
      .enter()
      .append("rect")
      .attr("class", classes.bar)
      .attr("x", this.onScaleName)
      .attr("width", this.x.bandwidth())
      .attr("y", this.onScaleValue)
      .attr("height", d => height - this.onScaleValue(d));

    const line: d3.Line<IBarData> = d3
      .line<IBarData>()
      .x(d => {
        const x = this.onScaleName(d);
        const bandWidth = this.x.bandwidth();

        if (x && bandWidth) {
          return x + bandWidth / 2;
        }

        return 0;
      })
      .y(this.onScaleValue)
      .curve(d3.curveMonotoneX);

    this.svg
      .append("line")
      .attr("x1", 0)
      .attr("y1", this.y(1))
      .attr("x2", width)
      .attr("y2", this.y(1))
      .attr("stroke-width", 2)
      .attr("stroke", "red");

    this.svg
      .append("path")
      .data([data])
      .attr("class", classes.line)
      .attr("d", line);

    this.svg
      .selectAll(classes.dot)
      .data(data)
      .enter()
      .append("circle")
      .attr("class", classes.dot)
      .attr("r", 4)
      .attr("cx", d => {
        const x = this.onScaleName(d);
        const bandWidth = this.x.bandwidth();

        if (x && bandWidth) {
          return x + bandWidth / 2;
        }

        return 0;
      })
      .attr("cy", this.onScaleValue);

    /**
     * create the text labels at the top of each bar
     * the label is current component eigenvalue
     */
    this.svg
      .selectAll(classes.label)
      .data(data)
      .enter()
      .append("text")
      .attr("dy", "0.65em")
      .attr("class", classes.label)
      .attr("x", d => {
        const x = this.onScaleName(d);
        const bandWidth = this.x.bandwidth();

        if (x && bandWidth) {
          return x + bandWidth / 2;
        }

        return 0;
      })
      .attr("y", d => this.onScaleValue(d) - 16)
      .text(d => `${round(d.value, 2)}`);
  };

  public render() {
    const { classes, title } = this.props;
    const { fullWidth, fullHeight } = this.state;

    return (
      <div className={classes.root}>
        {title && (
          <Typography className={classes.title} variant="h6">
            {title}
          </Typography>
        )}
        <div
          className={classes.svgContainer}
          style={{ paddingBottom: `${(fullHeight / fullWidth) * 100}%` }}
        >
          <svg className={classes.svg} id="bar" />
        </div>
      </div>
    );
  }
}

export const BarChart = compose<IBarChartProps, any>(withStyles(styles))(
  BarChartBase
);
