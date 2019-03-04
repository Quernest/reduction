// import Button from "@material-ui/core/Button";
import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import map from "lodash/map";
import unzip from "lodash/unzip";
import MUIDataTable from "mui-datatables";
import React, { useMemo } from "react";
import { IPCACalculations } from "src/models/pca.model";
import { IParsedCSV } from "src/utils/csv";
import {
  generateColumns,
  generateData,
  MUITableOptions
} from "src/utils/table";

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
    const rows = [observations, ...values];
    const data = generateData(rows);

    return (
      <div className={classes.tableBox}>
        <MUIDataTable
          title="Original dataset"
          data={data}
          columns={columns}
          options={MUITableOptions}
        />
      </div>
    );
  }, [observations, values, variables]);

  const AdjustedDatasetTable = useMemo(() => {
    const columns = generateColumns(variables);
    const rows = [observations, ...adjustedDataset];
    const data = generateData(rows);

    return (
      <div className={classes.tableBox}>
        <MUIDataTable
          title="Adjusted dataset"
          data={data}
          columns={columns}
          options={MUITableOptions}
        />
      </div>
    );
  }, [observations, adjustedDataset, variables]);

  const CovarianceTable = useMemo(() => {
    const columns = generateColumns(tailedVariables);
    const rows = covariance;
    const data = generateData(rows);

    return (
      <div className={classes.tableBox}>
        <MUIDataTable
          title="Covariance matrix"
          data={data}
          columns={columns}
          options={MUITableOptions}
        />
      </div>
    );
  }, [covariance, tailedVariables]);

  const AnalysisTable = useMemo(() => {
    const columns = generateColumns([
      "Component",
      "Eigenvalue",
      "Difference b/n eigenvalues",
      "Proportion, %",
      "Cumulative, %"
    ]);
    const rows = [
      map(eigens.lambda.x, (_, i) => `PC${i + 1}`),
      eigens.lambda.x,
      differences,
      proportion,
      cumulative
    ];
    const data = generateData(rows);

    return (
      <div className={classes.tableBox}>
        <div className={classes.analysisInfo}>
          <Typography variant="body2" gutterBottom={true}>
            Number of components equal to total number of variables:{" "}
            <strong>{tailedVariables.length}</strong>
          </Typography>
          <Typography variant="body2" gutterBottom={true}>
            All <strong>{tailedVariables.length}</strong> components explain{" "}
            <strong>{totalProportion}%</strong> variation of the data
          </Typography>
          <Typography variant="body2" gutterBottom={true}>
            <strong>{amountOfImportantComponents}</strong> component
            {amountOfImportantComponents > 1 ? "s" : ""} have eigenvalue
            {amountOfImportantComponents > 1 ? "s" : ""} above 1 and explain{" "}
            <strong>{importantComponentsVariance}%</strong> of variation.
          </Typography>
        </div>
        <MUIDataTable
          title="Analysis"
          data={data}
          columns={columns}
          options={MUITableOptions}
        />
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
    const columns = generateColumns(
      map(["Loadings", ...tailedVariables], (variable, i) =>
        i === 0 ? variable : `PC${i}`
      )
    );
    const rows = [tailedVariables, ...unzip<number>(eigens.E.x)];
    const data = generateData(rows);

    return (
      <div className={classes.tableBox}>
        <MUIDataTable
          title="Loadings (i.e., Q matrix)"
          data={data}
          columns={columns}
          options={MUITableOptions}
        />
      </div>
    );
  }, [eigens.E.x, tailedVariables]);

  const LinearCombinationsTable = useMemo(() => {
    const columns = generateColumns(
      map(variables, (variable, i) => (i === 0 ? variable : `PC${i}`))
    );
    const rows = [observations, ...linearCombinations];
    const data = generateData(rows);

    return (
      <div className={classes.tableBox}>
        <MUIDataTable
          title="Linear Combinations"
          data={data}
          columns={columns}
          options={MUITableOptions}
        />
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
