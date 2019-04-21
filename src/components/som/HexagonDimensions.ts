export class HexagonDimensions {
  public incircleRadius: number = 0;
  public circumcircleRadius: number = 0;
  public shortDiagonal: number = 0;
  public longDiagonal: number = 0;

  public constructor(
    width: number,
    height: number,
    columns: number,
    rows: number
  ) {
    this.incircleRadius = this.getIncircleRadius(width, height, columns, rows);
    this.shortDiagonal = this.getShortDiagonal(this.incircleRadius);
    this.longDiagonal = this.getLongDiagonal(this.shortDiagonal);
    this.circumcircleRadius = this.getCircumcircleRadius(this.longDiagonal);
  }

  private getIncircleRadius(
    width: number,
    height: number,
    columns: number,
    rows: number
  ): number {
    return Math.max(
      width / (Math.sqrt(3) * columns + 3),
      height / ((rows + 3) * 1.5)
    );
  }

  private getShortDiagonal(incircleRadius: number): number {
    return incircleRadius * 2;
  }

  private getLongDiagonal(shortDiagonal: number): number {
    return 2 * (shortDiagonal / Math.sqrt(3));
  }

  private getCircumcircleRadius(longDiagonal: number): number {
    return longDiagonal / 2;
  }
}
