import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import filter from "lodash/filter";
import includes from "lodash/includes";
import round from "lodash/round";
import React from "react";
import { Table, generateColumns, generateRows } from "../";
import { IDataset, IDatasetRequiredColumnsIndexes } from "../../models";

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

  const AnalysisTable = React.useMemo(() => {
    const columnNames = [
      "Component",
      "Eigenvalue",
      "Explained variance",
      "Cumulative variance"
    ];

    const columns = generateColumns(columnNames);

    const rows = generateRows(
      [components, eigenvalues, explainedVariance, cumulativeVariance],
      columnNames
    );

    return (
      <div className={classes.tableBox}>
        <Table title="Analysis" rows={rows} columns={columns} />
        <div className={classes.analysisInfo}>
          <Typography variant="body1" gutterBottom={true}>
            Number of components equal to total number of variables:{" "}
            <strong>{factors.length}</strong>
          </Typography>
          <Typography variant="body1" gutterBottom={true}>
            All <strong>{factors.length}</strong> components explain{" "}
            <strong>
              {round(cumulativeVariance[cumulativeVariance.length - 1] * 100)}%
            </strong>{" "}
            variation of the data
          </Typography>
          <Typography variant="body1" gutterBottom={true}>
            <strong>{importantComponents.length}</strong> component
            {importantComponents.length > 1 ? "s" : ""} have eigenvalue
            {importantComponents.length > 1 ? "s" : ""} above 1 and explain{" "}
            <strong>
              {round(cumulativeVariance[importantComponents.length - 1] * 100)}%
            </strong>{" "}
            of variation.
          </Typography>
        </div>
      </div>
    );
  }, [
    eigenvalues,
    explainedVariance,
    cumulativeVariance,
    importantComponents,
    factors
  ]);

  const LoadingsTable = React.useMemo(() => {
    const columnNames = ["Loadings", ...components];
    const columns = generateColumns(columnNames);

    const rows = generateRows([factors, ...loadings], columnNames);

    const importantComponentNames = filter(components, component =>
      includes(importantComponents, component)
    );

    const importantComponentsList = ["Loadings", ...importantComponentNames];

    return (
      <div className={classes.tableBox}>
        <Table
          title="Loadings (i.e., Q matrix)"
          importantComponentsList={importantComponentsList}
          rows={rows}
          columns={columns}
          intervalFilter={true}
        />
      </div>
    );
  }, [loadings, factors, importantComponents]);

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
          title="Predicted principal components"
          rows={rows}
          columns={columns}
          importantComponentsList={importantComponentsList}
        />
      </div>
    );
  }, [observations, variables, predictions, importantComponents]);

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
