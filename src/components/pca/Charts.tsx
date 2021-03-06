import { makeStyles } from "@material-ui/styles";
import map from "lodash/map";
import zipWith from "lodash/zipWith";
import React from "react";
import { IBarData, Vectors, Points } from "../../models";
import { getColumn } from "../../utils";
import { BarChart, Biplot } from ".";
import { useTranslation } from 'react-i18next';

interface IChartsProps {
  factors: string[];
  components: string[];
  eigenvalues: number[];
  loadings: number[][];
  adjustedDataset: number[][];
  selectedComponents: { x: number; y: number };
}

const useStyles = makeStyles({
  root: {
    flexGrow: 1
  }
});

export const Charts: React.FC<IChartsProps> = ({
  factors,
  components,
  loadings,
  eigenvalues,
  adjustedDataset,
  selectedComponents: { x, y }
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const biplotTitle = t('biplot.title');
  const memoizedBiplot = React.useMemo(() => {
    const x2s = getColumn<number>(loadings, x);
    const y2s = getColumn<number>(loadings, y);
    const x1s = map(Array(x2s.length), () => 0);
    const y1s = map(Array(y2s.length), () => 0);
    const vectors: Vectors = [x1s, y1s, x2s, y2s];
    const points: Points = [adjustedDataset[x], adjustedDataset[y]];

    return (
      <Biplot
        title={biplotTitle}
        eigenvectors={vectors}
        factors={factors}
        xAxisLabel={components[x]}
        yAxisLabel={components[y]}
        points={points}
      />
    );
  }, [biplotTitle, adjustedDataset, loadings, x, y, components, factors]);

  const barTitle = t('bar.title');
  const barXAxisLabel = t('bar.xAxisLabel');
  const barYAxisLabel = t('bar.yAxisLabel');
  const memoizedBar = React.useMemo(() => {
    const data = zipWith<string, number, IBarData>(
      components,
      eigenvalues,
      (name, value) => ({
        name,
        value
      })
    );

    return (
      <BarChart
        title={barTitle}
        data={data}
        xAxisLabel={barXAxisLabel}
        yAxisLabel={barYAxisLabel}
      />
    );
  }, [barTitle, barXAxisLabel, barYAxisLabel, eigenvalues, components]);

  return (
    <div className={classes.root}>
      {memoizedBiplot}
      {memoizedBar}
    </div>
  );
};
