import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import map from "lodash/map";
import unzip from "lodash/unzip";
import React, { useMemo } from "react";
import { IPCACalculations } from "src/models/pca.model";
import { IParsedCSV } from "src/utils/csv";
import { DXTable, generateColumns, generateRows } from "../Tables";

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

interface IProps {
  parsedFile: IParsedCSV;
  calculations: IPCACalculations;
}

export const Calculations = ({
  parsedFile,
  calculations
}: IProps): JSX.Element => {
  const classes = useStyles();
  const {
    adjustedDataset,
    covariance,
    eigens,
    analysis: {
      proportion,
      totalProportion,
      importantComponentsVariance,
      amountOfImportantComponents,
      differences,
      cumulative
    },
    linearCombinations
  } = calculations;
  const { tailedVariables, variables, observations, values } = parsedFile;
  // const [onlyImportantComponents, showImportantComponents] = useState<boolean>(
  //   false
  // );

  // function toggleImportantComponents() {
  //   showImportantComponents(!onlyImportantComponents);
  // }

  // function tableFilter(
  //   components: number[] = [],
  //   arr: any[] = [],
  //   hasFirstColumn?: boolean
  // ) {
  //   if (!components || components.length === 0) {
  //     return arr;
  //   }

  //   const offset = hasFirstColumn ? 1 : 0;
  //   const filtered = [];

  //   if (hasFirstColumn) {
  //     filtered.push(arr[0]);
  //   }

  //   components.forEach(component => {
  //     filtered.push(arr[component + offset]);
  //   });

  //   return filtered;
  // }

  const DatasetTable = useMemo(() => {
    const columns = generateColumns(variables);
    const rows = generateRows([observations, ...values], variables);

    return (
      <div className={classes.tableBox}>
        <DXTable title="Original dataset" rows={rows} columns={columns} />
      </div>
    );
  }, [observations, values, variables]);

  const AdjustedDatasetTable = useMemo(() => {
    const columns = generateColumns(variables);
    const rows = generateRows([observations, ...adjustedDataset], variables);

    return (
      <div className={classes.tableBox}>
        <DXTable title="Adjusted dataset" rows={rows} columns={columns} />
      </div>
    );
  }, [observations, adjustedDataset, variables]);

  const CovarianceTable = useMemo(() => {
    const columns = generateColumns(tailedVariables);
    const rows = generateRows(covariance, tailedVariables);

    return (
      <div className={classes.tableBox}>
        <DXTable title="Covariance matrix" rows={rows} columns={columns} />
      </div>
    );
  }, [covariance, tailedVariables]);

  const AnalysisTable = useMemo(() => {
    const columnNames = [
      "Component",
      "Eigenvalue",
      "Difference b/n eigenvalues",
      "Proportion, %",
      "Cumulative, %"
    ];

    const columns = generateColumns(columnNames);

    const rows = generateRows(
      [
        map(eigens.lambda.x, (_, i) => `PC${i + 1}`),
        eigens.lambda.x,
        differences,
        proportion,
        cumulative
      ],
      columnNames
    );

    return (
      <div className={classes.tableBox}>
        <DXTable title="Analysis" rows={rows} columns={columns} />
        <div className={classes.analysisInfo}>
          <Typography variant="body1" gutterBottom={true}>
            Number of components equal to total number of variables:{" "}
            <strong>{tailedVariables.length}</strong>
          </Typography>
          <Typography variant="body1" gutterBottom={true}>
            All <strong>{tailedVariables.length}</strong> components explain{" "}
            <strong>{totalProportion}%</strong> variation of the data
          </Typography>
          <Typography variant="body1" gutterBottom={true}>
            <strong>{amountOfImportantComponents}</strong> component
            {amountOfImportantComponents > 1 ? "s" : ""} have eigenvalue
            {amountOfImportantComponents > 1 ? "s" : ""} above 1 and explain{" "}
            <strong>{importantComponentsVariance}%</strong> of variation.
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
    amountOfImportantComponents,
    importantComponentsVariance
  ]);

  const LoadingsTable = useMemo(() => {
    const columnNames = map(["Loadings", ...tailedVariables], (variable, i) =>
      i === 0 ? variable : `PC${i}`
    );

    const columns = generateColumns(columnNames);
    const rows = generateRows(
      [tailedVariables, ...unzip<number>(eigens.E.x)],
      columnNames
    );

    return (
      <div className={classes.tableBox}>
        <DXTable
          title="Loadings (i.e., Q matrix)"
          rows={rows}
          columns={columns}
        />
      </div>
    );
  }, [eigens.E.x, tailedVariables]);

  const LinearCombinationsTable = useMemo(() => {
    const columnNames = map(variables, (variable, i) =>
      i === 0 ? variable : `PC${i}`
    );

    const columns = generateColumns(columnNames);
    const rows = generateRows(
      [observations, ...linearCombinations],
      columnNames
    );

    return (
      <div className={classes.tableBox}>
        <DXTable title="Linear Combinations" rows={rows} columns={columns} />
      </div>
    );
  }, [observations, variables, linearCombinations]);

  return (
    <div className={classes.root}>
      <div className={classes.tables}>
        {DatasetTable}
        {AdjustedDatasetTable}
        {CovarianceTable}
        {AnalysisTable}
        {LoadingsTable}
        {LinearCombinationsTable}
      </div>
    </div>
  );
};
