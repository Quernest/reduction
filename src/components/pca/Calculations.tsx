import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import filter from "lodash/filter";
import includes from "lodash/includes";
import map from 'lodash/map';
import round from "lodash/round";
import React from "react";
import { Table, generateColumns, generateRows } from "../";
import { IDataset, IDatasetRequiredColumnsIndexes } from "../../models";
import { useTranslation } from 'react-i18next';
import { toPercentage } from 'src/utils';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1
  },
  tableTitle: {
    marginBottom: theme.spacing(1)
  },
  tableBox: {
    flexGrow: 1,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3)
  },
  tables: {
    flexGrow: 1
  },
  analysisInfo: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}));

interface ICalculationsProps {
  dataset: IDataset;
  loadings: number[][];
  predictions: number[][];
  eigenvalues: number[];
  explainedVariance: number[];
  cumulativeVariance: number[];
  importantComponents: string[];
  components: string[];
  datasetRequiredColumnsIdxs: IDatasetRequiredColumnsIndexes;
}

export const Calculations: React.FC<ICalculationsProps> = ({
  dataset: { factors, variables, observations },
  loadings,
  predictions,
  eigenvalues,
  explainedVariance,
  cumulativeVariance,
  importantComponents,
  components,
  datasetRequiredColumnsIdxs: { observationsIdx }
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const analysisTableColumnNames = [
    t('component'),
    t('eigenvalue'),
    `${t('explainedVariance')}, %`,
    `${t('cumulativeVariance')}, %`
  ];

  const AnalysisTable = React.useMemo(() => {
    const columns = generateColumns(analysisTableColumnNames);

    const rows = generateRows(
      [components, eigenvalues, map(explainedVariance, toPercentage), map(cumulativeVariance, toPercentage)],
      analysisTableColumnNames
    );

    return (
      <div className={classes.tableBox}>
        <Table title={t('analysis')} rows={rows} columns={columns} />
        <div className={classes.analysisInfo}>
          <Typography variant="body1" gutterBottom={true}>
            {t('numberOfComponentsEqual', { count: factors.length })}
          </Typography>
          <Typography variant="body1" gutterBottom={true}>
            {t('explainVariationOfTheData', {
              count: factors.length,
              percentage: `${round(toPercentage(cumulativeVariance[cumulativeVariance.length - 1]))}%`
            })}
          </Typography>
          <Typography variant="body1" gutterBottom={true}>
            {t('numberOfImportantComponents', {
              count: importantComponents.length,
              percentage: `${round(toPercentage(cumulativeVariance[importantComponents.length - 1]))}%`
            })}
          </Typography>
        </div>
      </div>
    );
  }, [
      analysisTableColumnNames,
      eigenvalues,
      explainedVariance,
      cumulativeVariance,
      importantComponents,
      factors
    ]);

  const loadingsTableTitle = t('factorLoadings');
  const factor = t('variable');
  const LoadingsTable = React.useMemo(() => {
    const columnNames = [factor, ...components];
    const columns = generateColumns(columnNames);
    const rows = generateRows([factors, ...loadings], columnNames);
    const importantComponentNames = filter(components, component =>
      includes(importantComponents, component)
    );
    const importantComponentsList = [factor, ...importantComponentNames];

    return (
      <div className={classes.tableBox}>
        <Table
          title={loadingsTableTitle}
          importantComponentsList={importantComponentsList}
          rows={rows}
          columns={columns}
          intervalFilter={true}
        />
      </div>
    );
  }, [loadingsTableTitle, factor, loadings, factors, importantComponents]);

  const predictionsTableTitle = t('predictions');
  const PredictionsTable = React.useMemo(() => {
    const columnNames = [variables[observationsIdx], ...components];
    const columns = generateColumns(columnNames);
    const rows = generateRows([observations, ...predictions], columnNames);

    const importantComponentNames = filter(components, component =>
      includes(importantComponents, component)
    );

    const importantComponentsList = [
      columnNames[0],
      ...importantComponentNames
    ];

    return (
      <div className={classes.tableBox}>
        <Table
          title={predictionsTableTitle}
          rows={rows}
          columns={columns}
          importantComponentsList={importantComponentsList}
        />
      </div>
    );
  }, [predictionsTableTitle, observations, variables, predictions, importantComponents]);

  return (
    <div className={classes.root}>
      <div className={classes.tables}>
        {AnalysisTable}
        {LoadingsTable}
        {PredictionsTable}
      </div>
    </div>
  );
};
