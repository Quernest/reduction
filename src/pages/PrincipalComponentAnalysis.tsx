import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { makeStyles } from "@material-ui/styles";
import has from "lodash/has";
import isUndefined from "lodash/isUndefined";
import React from "react";
import {
  CalculateControls,
  Calculations,
  Charts,
  ErrorMessage,
  UploadControls,
  VisualizeControls
} from "src/components";
import {
  IDataset,
  IDatasetRequiredColumnsIndexes,
  IFilePreview,
  IPCACalculations
} from "src/models";
import CalculateWorker from "worker-loader!src/components/PrincipalComponentAnalysis/calculate.worker";
import UploadWorker from "worker-loader!src/components/PrincipalComponentAnalysis/upload.worker";

const useStyles = makeStyles(({ spacing, breakpoints }: Theme) => ({
  root: {
    flexGrow: 1,
    padding: spacing.unit * 2,
    [breakpoints.up("sm")]: {
      padding: spacing.unit * 3
    }
  },
  wrap: {
    width: "100%",
    maxWidth: breakpoints.values.lg,
    marginLeft: "auto",
    marginRight: "auto"
  },
  progress: {
    flexGrow: 1
  },
  back: {
    marginLeft: -spacing.unit,
    marginRight: spacing.unit
  },
  divider: {
    marginBottom: spacing.unit * 3
  }
}));

interface IState {
  uploading?: boolean;
  uploaded?: boolean;
  calculating?: boolean;
  calculated?: boolean;
  visualized?: boolean;
}

const initialState: IState = {
  uploading: false,
  uploaded: false,
  calculating: false,
  calculated: false,
  visualized: false
};

export const PrincipalComponentAnalysis = (): JSX.Element => {
  const classes = useStyles();

  /**
   * original file (.csv or .txt)
   */
  const [file, setFile] = React.useState<File | undefined>(undefined);

  /**
   * processed file preview
   */
  const [filePreview, setFilePreview] = React.useState<IFilePreview>({
    rows: [],
    columns: []
  });

  /**
   * parsed file preview
   */
  const [dataset, setDataset] = React.useState<IDataset>({
    variables: [],
    factors: [],
    values: [],
    types: [],
    observations: []
  });

  /**
   * error string, component to display at the bottom of the page
   */
  const [error, setError] = React.useState<string | undefined>(undefined);

  /**
   * current page state
   */
  const [state, setState] = React.useState<IState>(initialState);

  /**
   * object with the results of calculations
   * of the principal component method
   */
  const [calculations, setCalculations] = React.useState<IPCACalculations>({
    originalDataset: [],
    adjustedDataset: [],
    covariance: [],
    eigens: {
      E: {
        y: [],
        x: []
      },
      lambda: {
        x: [],
        y: []
      }
    },
    linearCombinations: [],
    analysis: {
      proportion: [],
      cumulative: [],
      differences: [],
      totalProportion: 0,
      importantComponents: [],
      importantComponentsVariance: 0,
      components: []
    }
  });

  /**
   * which handles the downloaded
   * csv file in the background process
   */
  const [uploadWorker, createUploadWorker] = React.useState<Worker | undefined>(
    undefined
  );

  /**
   * calculate worker which performs the calculations
   * of the principal component method
   * in the background process
   */
  const [calculateWorker, createCalculateWorker] = React.useState<
    Worker | undefined
  >(undefined);

  /**
   * selected components.
   * contains selected x and y axes of principal components
   */
  const [selectedComponents, setSelectedComponents] = React.useState<{
    x: number;
    y: number;
  }>({
    x: 0,
    y: 1
  });

  /**
   * seelct required dataset columns
   */
  const [
    datasetRequiredColumnsIdxs,
    setDatasetRequiredColumnsIdxs
  ] = React.useState<IDatasetRequiredColumnsIndexes>({
    observationsIdx: 0,
    typesIdx: undefined
  });

  const { analysis } = calculations;
  const { uploading, uploaded, calculated, calculating, visualized } = state;

  // create workers on componentDidMount
  React.useEffect(() => {
    function onUploadWorkerMsg(event: MessageEvent) {
      if (has(event.data, "error")) {
        setError(event.data.error);
        setState({ ...state, uploaded: false, uploading: false });
      } else {
        cleanErrors();
        setFilePreview(event.data.filePreview);
        setState({ ...state, uploaded: true, uploading: false });
      }
    }

    function onCalculateWorkerMsg(event: MessageEvent) {
      if (has(event.data, "error")) {
        setError(event.data.error);
        setState({ ...state, calculated: false, calculating: false });
      } else {
        cleanErrors();
        setDataset(event.data.dataset);
        setCalculations(event.data.calculations);
        setState({ ...state, calculated: true, calculating: false });
      }
    }

    if (isUndefined(uploadWorker)) {
      createUploadWorker(new UploadWorker());
    } else {
      uploadWorker.addEventListener("message", onUploadWorkerMsg, false);
    }

    if (isUndefined(calculateWorker)) {
      createCalculateWorker(new CalculateWorker());
    } else {
      calculateWorker.addEventListener("message", onCalculateWorkerMsg, false);
    }

    return () => {
      if (!isUndefined(uploadWorker)) {
        uploadWorker.removeEventListener("message", onUploadWorkerMsg, false);
        uploadWorker.terminate();
      }

      if (!isUndefined(calculateWorker)) {
        calculateWorker.removeEventListener(
          "message",
          onCalculateWorkerMsg,
          false
        );
        calculateWorker.terminate();
      }
    };
  }, [uploadWorker, calculateWorker]);

  function onChangeFile(chosenFile?: File, err?: string) {
    if (err) {
      setError(err);
    } else {
      cleanErrors();
      setFile(chosenFile);
    }
  }

  function onUploadFile() {
    if (!isUndefined(uploadWorker)) {
      setState({ ...state, uploading: true });
      uploadWorker.postMessage(file);
    }
  }

  function onCancelFile() {
    cleanErrors();
    setFile(undefined);
  }

  function onCalculate() {
    if (!isUndefined(calculateWorker)) {
      setState({ ...state, calculating: true });
      calculateWorker.postMessage({ datasetRequiredColumnsIdxs, filePreview });
    }
  }

  function onVisualize() {
    setState({ ...state, visualized: true });
  }

  function onBack() {
    setState({ ...state, visualized: false });
  }

  function onChangeSelectedComponents(newSelectedComponents: {
    x: number;
    y: number;
  }) {
    setSelectedComponents({ ...selectedComponents, ...newSelectedComponents });
  }

  function onChangeDatasetRequiredColumns(
    newDatasetRequiredColumnsIdxs: IDatasetRequiredColumnsIndexes
  ) {
    setDatasetRequiredColumnsIdxs(newDatasetRequiredColumnsIdxs);
  }

  function cleanErrors() {
    setError(undefined);
  }

  return (
    <div className={classes.root}>
      <div className={classes.wrap}>
        <Typography variant="h1">
          {visualized && (
            <IconButton className={classes.back} onClick={onBack}>
              <ArrowBackIcon />
            </IconButton>
          )}
          Principal Component Analysis
        </Typography>
        {(visualized || calculated) && (
          <VisualizeControls
            visualized={visualized}
            analysis={analysis}
            onVisualize={onVisualize}
            onChangeSelectedComponents={onChangeSelectedComponents}
            selectedComponents={selectedComponents}
          />
        )}
        {visualized && (
          <Charts
            dataset={dataset}
            calculations={calculations}
            selectedComponents={selectedComponents}
          />
        )}
        {calculated && !visualized && (
          <Calculations
            datasetRequiredColumnsIdxs={datasetRequiredColumnsIdxs}
            dataset={dataset}
            calculations={calculations}
          />
        )}
        {uploaded && !calculated && (
          <CalculateControls
            datasetRequiredColumnsIdxs={datasetRequiredColumnsIdxs}
            filePreview={filePreview}
            onCalculate={onCalculate}
            onChangeDatasetRequiredColumns={onChangeDatasetRequiredColumns}
            calculating={calculating}
          />
        )}
        {!uploaded && !calculated && (
          <>
            <Typography variant="body1" paragraph={true}>
              Process two-dimensional data arrays using principal component
              analysis.
            </Typography>
            <Divider className={classes.divider} />
            <UploadControls
              file={file}
              onUpload={onUploadFile}
              onChange={onChangeFile}
              onCancel={onCancelFile}
              uploading={uploading}
            />
          </>
        )}
        {error && <ErrorMessage text={error} />}
      </div>
    </div>
  );
};
