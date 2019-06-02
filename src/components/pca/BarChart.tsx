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
import { SVG } from "../";

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
      fontFamily: theme.typography.fontFamily
    },
    bar: {
      fill: theme.palette.primary.main
    },
    barValue: {
      fontSize: theme.typography.fontSize,
      fontFamily: theme.typography.fontFamily
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
      fontSize: theme.typography.fontSize,
      fontFamily: theme.typography.fontFamily
    }
  });

interface IBarChartProps extends WithStyles<typeof styles> {
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  data: IBarData[];
}

class BarChartBase extends React.Component<IBarChartProps, IChartState> {
  protected svg: d3.Selection<d3.BaseType, any, HTMLElement, any>;
  protected xScale: d3.ScaleBand<string>;
  protected yScale: d3.ScaleLinear<number, number>;
  protected gAxisBottom: d3.Selection<d3.BaseType, any, HTMLElement, any>;
  protected gAxisLeft: d3.Selection<d3.BaseType, any, HTMLElement, any>;

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
    return this.xScale(name) || 0;
  };

  private onScaleValue = ({ value }: IBarData): number => {
    return this.yScale(value) || 0;
  };

  public componentDidMount() {
    this.selectSVGElement();
    this.drawAxes();
    this.drawBars();
  }

  public componentDidUpdate(nextProps: IBarChartProps) {
    if (this.props.xAxisLabel !== nextProps.xAxisLabel || this.props.yAxisLabel !== nextProps.yAxisLabel) {
      this.svg.select(`text#axis-x-label`).remove();
      this.svg.select(`text#axis-y-label`).remove();

      this.drawAxesLabels();
    }
  }

  public selectSVGElement() {
    const { margin } = this.state;

    this.svg = d3
      .select("#bar")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  }

  public drawAxes() {
    const { classes, data } = this.props;
    const { width, height } = this.state;

    this.xScale = d3
      .scaleBand()
      .range([0, width])
      .padding(0.25)
      .domain(data.map(d => d.name));
    this.yScale = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, d => d.value) || 0]);
    this.gAxisBottom = this.svg
      .append("g")
      .attr("class", classes.axis)
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(this.xScale));
    this.gAxisLeft = this.svg
      .append("g")
      .attr("class", classes.axis)
      .call(d3.axisLeft(this.yScale));

    this.drawAxesLabels();
  }

  private drawAxesLabels(): void {
    const { classes, xAxisLabel, yAxisLabel } = this.props;
    const { width, height, margin } = this.state;

    this.svg
      .append("text")
      .text(yAxisLabel || "Eigenvalue")
      .attr("transform", "rotate(-90)")
      .attr("x", 0 - height / 2)
      .attr("y", 0 - margin.left)
      .attr("dy", "1em")
      .attr("id", "axis-x-label")
      .attr("class", classes.axisLabel)
      .style("text-anchor", "middle");
    this.svg
      .append("text")
      .text(xAxisLabel || "Number of PCs")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom)
      .attr("dy", "-0.5em")
      .attr("id", "axis-y-label")
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
      .attr("width", this.xScale.bandwidth())
      .attr("y", this.onScaleValue)
      .attr("height", d => height - this.onScaleValue(d));

    const line: d3.Line<IBarData> = d3
      .line<IBarData>()
      .x(d => {
        const x = this.onScaleName(d);
        const bandWidth = this.xScale.bandwidth();

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
      .attr("y1", this.yScale(1))
      .attr("x2", width)
      .attr("y2", this.yScale(1))
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
        const bandWidth = this.xScale.bandwidth();

        if (x && bandWidth) {
          return x + bandWidth / 2;
        }

        return 0;
      })
      .attr("cy", this.onScaleValue);

    this.svg
      .selectAll(classes.label)
      .data(data)
      .enter()
      .append("text")
      .attr("dy", "0.65em")
      .attr("class", classes.label)
      .attr("x", d => {
        const x = this.onScaleName(d);
        const bandWidth = this.xScale.bandwidth();

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
          <Typography
            variant="h2"
            gutterBottom={true}
            className={classes.title}
          >
            {title}
          </Typography>
        )}
        <SVG id="bar" width={fullWidth} height={fullHeight} />
      </div>
    );
  }
}

export const BarChart = compose<IBarChartProps, any>(withStyles(styles))(
  BarChartBase
);
