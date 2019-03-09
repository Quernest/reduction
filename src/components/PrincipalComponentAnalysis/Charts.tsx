import { Theme } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import Hidden from "@material-ui/core/Hidden";
import { makeStyles } from "@material-ui/styles";
import map from "lodash/map";
import zipWith from "lodash/zipWith";
import React, { useMemo } from "react";
import { IBarData, IPCACalculations, Points, Vectors } from "src/models";
import { getColumn, IParsedCSV } from "src/utils";
import { Bar, Biplot } from "./";

interface IProps {
  calculations: IPCACalculations;
  parsedFile: IParsedCSV;
  selectedComponents: { x: number; y: number };
}

const useStyles = makeStyles(({ spacing }: Theme) => ({
  root: {
    flexGrow: 1
  },
  divider: {
    marginTop: spacing.unit * 2,
    marginBottom: spacing.unit * 2
  }
}));

export const Charts = ({
  calculations: {
    adjustedDataset,
    eigens,
    analysis: { components }
  },
  parsedFile: { tailedVariables },
  selectedComponents: { x, y }
}: IProps) => {
  const classes = useStyles();

  const memoizedBiplot = useMemo(() => {
    const x2s = getColumn(eigens.E.x, x);
    const y2s = getColumn(eigens.E.x, y);
    const x1s = map(Array(x2s.length), () => 0);
    const y1s = map(Array(y2s.length), () => 0);
    const vectors: Vectors = [x1s, y1s, x2s, y2s];
    const points: Points = [adjustedDataset[x], adjustedDataset[y]];

    return (
      <Biplot
        title="Biplot of score variables"
        eigenvectors={vectors}
        variables={tailedVariables}
        xAxisLabel={components[x]}
        yAxisLabel={components[y]}
        points={points}
      />
    );
  }, [adjustedDataset, eigens.E.x, x, y, components, tailedVariables]);

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
      <Bar
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
      <Hidden smUp={true}>
        <Divider className={classes.divider} />
      </Hidden>
      {memoizedBar}
    </div>
  );
};
