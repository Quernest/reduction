import { createStyles, withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import * as d3 from "d3";
import round from "lodash/round";
import * as React from "react";
import { IChart } from "src/models/chart.model";
import { from2D } from "../../utils/transformations";

const styles = createStyles({
  root: {
    width: "100%"
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

interface IBarData {
  component: string;
  eigenvalue: number;
}

interface IProps {
  title?: string;
  eigenvalues: number[];
  names: string[];
  classes?: any;
}

export const Bar = withStyles(styles)(
  class extends React.Component<IProps, IChart> {
    /**
     * main svg element
     */
    private svg: d3.Selection<d3.BaseType, any, HTMLElement, any>;

    /**
     * x axis
     */
    private x: d3.ScaleBand<string>;

    /**
     * y axis
     */
    private y: d3.ScaleLinear<number, number>;

    public readonly state = {
      margin: {
        top: 25,
        right: 25,
        bottom: 50,
        left: 50
      },
      fullWidth: 960,
      fullHeight: 425,
      get width() {
        return this.fullWidth - this.margin.left - this.margin.right;
      },
      get height() {
        return this.fullHeight - this.margin.top - this.margin.bottom;
      }
    };

    public componentDidMount() {
      const { eigenvalues, names } = this.props;

      /**
       * array of combined eigenvalues ​​that we display in bar columns
       */
      const combinedData: [string[], number[]] = [names, eigenvalues];

      /**
       * keys of this eigenvalues
       * by default describes:
       * component name, eigenvalue
       */
      const keys: string[] = ["component", "eigenvalue"];

      /**
       * formatted data which represents a collection of objects
       * with provided keys and eigenvalues
       */
      const data = from2D<IBarData>(combinedData, keys);

      this.selectSVGElement();
      this.drawAxes(data);
      this.drawBars(data);
    }

    private selectSVGElement(): void {
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

    private drawAxes(data: IBarData[]): void {
      const { width, height, margin } = this.state;

      this.x = d3
        .scaleBand()
        .range([0, width])
        .padding(0.25)
        .domain(data.map((d: IBarData, i: number): any => `PC ${i + 1}`));

      this.y = d3
        .scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(data, (d: IBarData): any => d.eigenvalue)]);

      this.svg
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(this.x));

      this.svg.append("g").call(d3.axisLeft(this.y));

      // y axis label
      this.svg
        .append("text")
        .text("Variances")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - height / 2)
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .style("font-size", "12px")
        .style("text-anchor", "middle");

      // x axis label
      this.svg
        .append("text")
        .text("Components")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .attr("dy", "-0.5em")
        .style("font-size", "12px")
        .style("text-anchor", "middle");
    }

    private drawBars(data: IBarData[]): void {
      const { height } = this.state;

      // draw bars based on data
      this.svg
        .selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("fill", "#3F51B5")
        .attr("x", (d: IBarData, i: number): any => this.x(`PC ${i + 1}`))
        .attr("width", this.x.bandwidth())
        .attr("y", (d: IBarData): any => this.y(d.eigenvalue))
        .attr("height", (d: IBarData) => height - this.y(d.eigenvalue));

      /**
       * the line based on the bar data
       */
      const line: d3.Line<IBarData> = d3
        .line<IBarData>()
        .x(
          (d: IBarData, i: number): number => {
            const x = this.x(`PC ${i + 1}`);
            const bandWidth = this.x.bandwidth();

            if (x && bandWidth) {
              return x + bandWidth / 2;
            }

            return 0;
          }
        )
        .y((d: IBarData): number => this.y(d.eigenvalue))
        .curve(d3.curveMonotoneX);

      // draw the path based on created line
      this.svg
        .append("path")
        .data([data])
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);

      // add the scatterplot
      this.svg
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("fill", "red")
        .attr("r", 3.5)
        .attr(
          "cx",
          (d: IBarData, i: number): number => {
            const x = this.x(`PC ${i + 1}`);
            const bandWidth = this.x.bandwidth();

            if (x && bandWidth) {
              return x + bandWidth / 2;
            }

            return 0;
          }
        )
        .attr("cy", (d: IBarData): number => this.y(d.eigenvalue));

      /**
       * create the text labels at the top of each bar
       * the label is current component eigen value
       */
      this.svg
        .selectAll(".text")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr(
          "x",
          (d: IBarData, i: number): number => {
            const x = this.x(`PC ${i + 1}`);
            const bandWidth = this.x.bandwidth();

            if (x && bandWidth) {
              return x + bandWidth / 2;
            }

            return 0;
          }
        )
        .attr("y", (d: IBarData): number => this.y(d.eigenvalue) - 16)
        .attr("dy", ".75em")
        .style("text-anchor", "start")
        .style(
          "font-size",
          (): string => {
            const bp: number = 15;
            const sm: number = 10;
            const md: number = 12;

            // change font size depending on the data length
            if (data.length > bp) {
              return `${sm}px`;
            }

            return `${md}px`;
          }
        )
        .text((d: IBarData): string => `${round(d.eigenvalue, 2)}`);
    }

    public render(): React.ReactNode {
      const { classes, title } = this.props;
      const { fullWidth, fullHeight } = this.state;

      return (
        <div className={classes.root}>
          {title && (
            <Typography variant="h6" paragraph={true}>
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
);
