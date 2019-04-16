import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import filter from "lodash/filter";
import includes from "lodash/includes";
import round from "lodash/round";
import unzip from "lodash/unzip";
import * as React from "react";
import { DXTable, generateColumns, generateRows } from "src/components";
import {
  IDataset,
  IDatasetRequiredColumnsIndexes,
  IPCACalculations
} from "src/models";

const useStyles = makeStyles(({ spacing, palette }: Theme) => ({
  root: {
    flexGrow: 1
  },
  tableTitle: {
    marginBottom: spacing.unit
  },
  tableBox: {
    flexGrow: 1,
    marginTop: spacing.unit * 2,
    marginBottom: spacing.unit * 3
  },
  tables: {
    flexGrow: 1
  },
  analysisInfo: {
    marginTop: spacing.unit * 2,
    marginBottom: spacing.unit * 2
  }
}));

interface ICalculationsProps {
  dataset: IDataset;
  calculations: IPCACalculations;
  datasetRequiredColumnsIdxs: IDatasetRequiredColumnsIndexes;
}

export const Calculations: React.FC<ICalculationsProps> = ({
  dataset: { factors, variables, observations },
  calculations: {
    eigens,
    analysis: {
      proportion,
      totalProportion,
      importantComponents,
      importantComponentsVariance,
      differences,
      components,
      cumulative
    },
    linearCombinations
  },
  datasetRequiredColumnsIdxs: { observationsIdx }
}): JSX.Element => {
  const classes = useStyles();

  const AnalysisTable = React.useMemo(() => {
    const columnNames = [
      "Component",
      "Eigenvalue",
      "Difference b/n eigenvalues",
      "Proportion, %",
      "Cumulative, %"
    ];

    const columns = generateColumns(columnNames);

    const rows = generateRows(
      [components, eigens.lambda.x, differences, proportion, cumulative],
      columnNames
    );

    return (
      <div className={classes.tableBox}>
        <DXTable title="Analysis" rows={rows} columns={columns} />
        <div className={classes.analysisInfo}>
          <Typography variant="body1" gutterBottom={true}>
            Number of components equal to total number of variables:{" "}
            <strong>{factors.length}</strong>
          </Typography>
          <Typography variant="body1" gutterBottom={true}>
            All <strong>{factors.length}</strong> components explain{" "}
            <strong>{round(totalProportion)}%</strong> variation of the data
          </Typography>
          <Typography variant="body1" gutterBottom={true}>
            <strong>{importantComponents.length}</strong> component
            {importantComponents.length > 1 ? "s" : ""} have eigenvalue
            {importantComponents.length > 1 ? "s" : ""} above 1 and explain{" "}
            <strong>{round(importantComponentsVariance)}%</strong> of variation.
          </Typography>
        </div>
      </div>
    );
  }, [
    eigens.lambda.x,
    differences,
    proportion,
    totalProportion,
    cumulative,
    importantComponentsVariance
  ]);

  const LoadingsTable = React.useMemo(() => {
    const columnNames = ["Loadings", ...components];
    const columns = generateColumns(columnNames);

    const rows = generateRows(
      [factors, ...unzip<number>(eigens.E.x)],
      columnNames
    );

    const importantComponentNames = filter(components, component =>
      includes(importantComponents, component)
    );

    const importantComponentsList = ["Loadings", ...importantComponentNames];

    return (
      <div className={classes.tableBox}>
        <DXTable
          title="Loadings (i.e., Q matrix)"
          importantComponentsList={importantComponentsList}
          rows={rows}
          columns={columns}
          intervalFilter={true}
        />
      </div>
    );
  }, [eigens.E.x, factors, importantComponents]);

  const PredictionsTable = React.useMemo(() => {
    const columnNames = [variables[observationsIdx], ...components];
    const columns = generateColumns(columnNames);
    const rows = generateRows(
      [observations, ...linearCombinations],
      columnNames
    );

    const importantComponentNames = filter(components, component =>
      includes(importantComponents, component)
    );

    const importantComponentsList = [
      columnNames[0],
      ...importantComponentNames
    ];

    return (
      <div className={classes.tableBox}>
        <DXTable
          title="Predicted principal components"
          rows={rows}
          columns={columns}
          importantComponentsList={importantComponentsList}
        />
      </div>
    );
  }, [observations, variables, linearCombinations, importantComponents]);

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
