// don't add unnecessary state properties here. It's only chart interface
export interface IChart {
  // total chart width and height
  fullWidth: number;
  fullHeight: number;
  // get width by this furmula -> this.fullWidth - this.margin.left - this.margin.right
  readonly width: number;
  // get height by this formula -> this.fullHeight - this.margin.top - this.margin.bottom
  readonly height: number;
  // chart margins
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// list of values
export type PointList = number[];

/**
 * collection of vectors with next structure:
 * [x, y]
 */
export type Points = [
  // array of X values
  PointList,
  // array of Y values
  PointList
];

/**
 * collection of vectors with next structure:
 * [x1, y1, x2, y2]
 * use destructuring
 */
export type Vectors = [
  // array of x1 values
  PointList,
  // array of y1 values
  PointList,
  // array of x2 values
  PointList,
  // array of y2 values
  PointList
];
