import { Theme } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import Hidden from "@material-ui/core/Hidden";
import { makeStyles } from "@material-ui/styles";
import React, { useMemo } from "react";
import { IPCACalculations, Points, Vectors } from "src/models";
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

  const points = useMemo(() => [adjustedDataset[x], adjustedDataset[y]], [
    adjustedDataset,
    x,
    y
  ]) as Points;

  const vectors = useMemo(() => {
    const x2s: number[] = getColumn(eigens.E.x, x);
    const y2s: number[] = getColumn(eigens.E.x, y);
    const x1s: number[] = Array(x2s.length).fill(0);
    const y1s: number[] = Array(y2s.length).fill(0);

    return [x1s, y1s, x2s, y2s];
  }, [eigens.E.x, x, y]) as Vectors;

  return (
    <div className={classes.root}>
      <Biplot
        title="Biplot of score variables"
        eigenvectors={vectors}
        variables={tailedVariables}
        xAxisLabel={components[x]}
        yAxisLabel={components[y]}
        points={points}
      />
      <Hidden smUp={true}>
        <Divider className={classes.divider} />
      </Hidden>
      <Bar
        title="Scree plot of eigenvalues"
        eigenvalues={eigens.lambda.x}
        variables={tailedVariables}
      />
    </div>
  );
};
