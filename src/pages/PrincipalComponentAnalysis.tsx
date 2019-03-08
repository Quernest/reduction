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
  Info,
  UploadControls,
  VisualizeControls
} from "src/components";
import { IPCACalculations } from "src/models";
import { IParsedCSV } from "src/utils";
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
   * error string, component to display at the bottom of the page
   */
  const [error, setError] = React.useState<string | undefined>(undefined);

  /**
   * current page state
   */
  const [state, setState] = React.useState<IState>(initialState);

  /**
   * processed file
   */
  const [parsedFile, setParsedFile] = React.useState<IParsedCSV>({
    variables: [],
    tailedVariables: [],
    observations: [],
    values: []
  });

  /**
   * object with the results of calculations
   * of the principal component method
   */
  const [calculations, setCalculations] = React.useState<IPCACalculations>({
    dataset: [],
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

  const { analysis } = calculations;
  const { uploading, uploaded, calculated, calculating, visualized } = state;

  function cleanErrors() {
    setError(undefined);
  }

  // create workers on componentDidMount
  React.useEffect(() => {
    const onUploadWorkerMsg = (event: MessageEvent) => {
      if (has(event.data, "error")) {
        setError(event.data.error);
        setState({ ...state, uploaded: false, uploading: false });
      } else {
        cleanErrors();
        setParsedFile(event.data.parsedFile);
        setState({ ...state, uploaded: true, uploading: false });
      }
    };

    const onCalculateWorkerMsg = (event: MessageEvent) => {
      setCalculations(event.data);
      setState({ ...state, calculated: true, calculating: false });
    };

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

  const onChangeFile = (chosenFile?: File, err?: string): void => {
    if (err) {
      setError(err);
    } else {
      cleanErrors();
      setFile(chosenFile);
    }
  };

  const onUploadFile = (): void => {
    if (!isUndefined(uploadWorker)) {
      setState({ ...state, uploading: true });
      uploadWorker.postMessage(file);
    }
  };

  const onCancelFile = (): void => {
    cleanErrors();
    setFile(undefined);
  };

  const onCalculate = (): void => {
    if (!isUndefined(calculateWorker)) {
      setState({ ...state, calculating: true });
      calculateWorker.postMessage(parsedFile);
    }
  };

  const onVisualize = (): void => {
    setState({ ...state, visualized: true });
  };

  const onBack = (): void => {
    setState({ ...state, visualized: false });
  };

  const onChangeSelectedComponents = (newSelectedComponents: {
    x: number;
    y: number;
  }): void => {
    setSelectedComponents({ ...selectedComponents, ...newSelectedComponents });
  };

  return (
    <div className={classes.root}>
      <div className={classes.wrap}>
        <Typography variant="h5" paragraph={true}>
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
            parsedFile={parsedFile}
            calculations={calculations}
            selectedComponents={selectedComponents}
          />
        )}
        {calculated && !visualized && (
          <Calculations parsedFile={parsedFile} calculations={calculations} />
        )}
        {uploaded && !calculated && (
          <CalculateControls
            parsedFile={parsedFile}
            onCalculate={onCalculate}
            calculating={calculating}
          />
        )}
        {!uploaded && !calculated && (
          <>
            <Info />
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
