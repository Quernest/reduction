import { Theme } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import map from "lodash/map";
import zipWith from "lodash/zipWith";
import React, { useMemo } from "react";
import {
  IBarData,
  IDataset,
  IPCACalculations,
  Points,
  Vectors
} from "src/models";
import { getColumn } from "src/utils";
import { BarChart, Biplot } from "./";

interface IProps {
  calculations: IPCACalculations;
  dataset: IDataset;
  selectedComponents: { x: number; y: number };
}

const useStyles = makeStyles(({ spacing }: Theme) => ({
  root: {
    flexGrow: 1
  }
}));

export const Charts = ({
  calculations: {
    adjustedDataset,
    eigens,
    analysis: { components }
  },
  dataset: { factors },
  selectedComponents: { x, y }
}: IProps) => {
  const classes = useStyles();

  const memoizedBiplot = useMemo(() => {
    const x2s = getColumn<number>(eigens.E.x, x);
    const y2s = getColumn<number>(eigens.E.x, y);
    const x1s = map(Array(x2s.length), () => 0);
    const y1s = map(Array(y2s.length), () => 0);
    const vectors: Vectors = [x1s, y1s, x2s, y2s];
    const points: Points = [adjustedDataset[x], adjustedDataset[y]];

    return (
      <Biplot
        title="Biplot of principal component scores"
        eigenvectors={vectors}
        factors={factors}
        xAxisLabel={components[x]}
        yAxisLabel={components[y]}
        points={points}
      />
    );
  }, [adjustedDataset, eigens.E.x, x, y, components, factors]);

  const memoizedBar = useMemo(() => {
    const data = zipWith<string, number, IBarData>(
      components,
      eigens.lambda.x,
      (name, value) => ({
        name,
        value
      })
    );

    return (
      <BarChart
        title="Scree plot of eigenvalues"
        data={data}
        xAxisLabel="Components"
        yAxisLabel="Variances"
      />
    );
  }, [eigens.lambda.x, components]);

  return (
    <div className={classes.root}>
      {memoizedBiplot}
      {memoizedBar}
    </div>
  );
};
