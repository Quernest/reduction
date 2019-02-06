import Typography from "@material-ui/core/Typography";
import * as React from "react";
import { Points, Vectors } from "src/models/chart.model";
import { IPCACalculations } from "src/models/pca.model";
import { IParsedCSV } from "src/utils/csv";
import { getMatrixColumn } from "src/utils/numbers";
import { SelectComponents } from "./";
import { Bar, Biplot } from "./";

interface IProps {
  onChangeSelectComponents: (newComponents: { x: number; y: number }) => void;
  components: { x: number; y: number };
  calculations: IPCACalculations;
  parsedFile: IParsedCSV;
}

export const Charts = ({
  onChangeSelectComponents,
  components,
  calculations,
  parsedFile
}: IProps) => {
  const { adjustedDataset, eigens, analysis } = calculations;
  const { headers } = parsedFile;
  const { x, y } = components;

  const points = React.useMemo(() => [adjustedDataset[x], adjustedDataset[y]], [
    adjustedDataset,
    x,
    y
  ]) as Points;

  const vectors = React.useMemo(() => {
    const x2s: number[] = getMatrixColumn(eigens.E.x, x);
    const y2s: number[] = getMatrixColumn(eigens.E.x, y);
    const x1s: number[] = Array(x2s.length).fill(0);
    const y1s: number[] = Array(y2s.length).fill(0);

    // return vectors
    return [x1s, y1s, x2s, y2s];
  }, [eigens.E.x, x, y]) as Vectors;

  return (
    <>
      <Typography variant="body1">
        You can select components what you want to see below
      </Typography>
      <SelectComponents
        analysis={analysis}
        onChange={onChangeSelectComponents}
        components={components}
      />
      <Biplot
        title="Biplot of score variables"
        eigenvectors={vectors}
        names={headers}
        xAxisLabel={`Component ${x + 1}`}
        yAxisLabel={`Component ${y + 1}`}
        points={points}
      />
      <Bar
        title="Scree plot of eigenvalues"
        eigenvalues={eigens.lambda.x}
        names={headers}
        analysis={analysis}
      />
    </>
  );
};
