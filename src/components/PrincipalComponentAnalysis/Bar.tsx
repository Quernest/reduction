import { createStyles, withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import * as d3 from "d3";
import * as React from "react";
import { IChart } from "src/models/chart.model";
import { from2D } from "../../utils/transformations";

const styles = createStyles({
  root: {
    height: "auto",
    width: "100%"
  }
});

interface IBarData {
  component: string;
  eigenvalue: number;
  comulative: number;
}

interface IProps {
  eigenvalues: number[];
  names: string[];
  analysis: number[];
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
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
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
      const { eigenvalues, names, analysis } = this.props;

      /**
       * array of combined eigenvalues ​​that we display in bar columns
       */
      const combinedData: [string[], number[], number[]] = [
        names,
        eigenvalues,
        analysis
      ];

      /**
       * keys of this eigenvalues
       * by default describes:
       * component name, eigenvalue, comulative percentage
       */
      const keys: string[] = ["component", "eigenvalue", "comulative"];

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
      const { width, height } = this.state;

      this.x = d3
        .scaleBand()
        .range([0, width])
        .padding(0.25)
        .domain(data.map((d: IBarData): any => d.component));
      this.y = d3
        .scaleLinear()
        .range([height, 0])
        .domain([0, 100]);

      this.svg
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(this.x));

      this.svg.append("g").call(d3.axisLeft(this.y));
    }

    private drawBars(data: IBarData[]): void {
      const { height } = this.state;

      this.svg
        .selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("fill", "#3F51B5")
        .attr("x", (d: IBarData): any => this.x(d.component))
        .attr("width", this.x.bandwidth())
        .attr("y", (d: IBarData): any => this.y(d.comulative))
        .attr("height", (d: IBarData) => height - this.y(d.comulative));

      /**
       * create the text labels at the top of each bar
       * the label is current component comulative value
       */
      this.svg
        .selectAll(".text")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr(
          "x",
          (d: IBarData): any => {
            const x = this.x(d.component);
            const bandWidth = this.x.bandwidth();

            if (x && bandWidth) {
              return x + bandWidth / 2;
            }

            return null;
          }
        )
        .attr(
          "y",
          (d: IBarData): any => {
            const dY: number = 12;

            return this.y(d.comulative) - dY;
          }
        )
        .attr("dy", ".75em")
        .style("text-anchor", "middle")
        .style("font-size", () => {
          const breakpoint: number = 15;
          const small: number = 10;
          const normal: number = 12;

          // change font size depending on the data length
          if (data.length > breakpoint) {
            return small;
          }

          return normal;
        })
        // display percentage
        .text((d: IBarData): any => `${d.comulative}%`);
    }

    public render(): React.ReactNode {
      const { classes } = this.props;

      return (
        <div className={classes.root}>
          <Typography variant="h6" paragraph={true}>
            Bar Chart
          </Typography>
          <svg id="bar" />
        </div>
      );
    }
  }
);
