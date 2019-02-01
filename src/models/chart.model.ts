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

export interface IPoint {
  x: number;
  y: number;
}

export interface IVector {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}
