import LinearProgress from "@material-ui/core/LinearProgress";
import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import debounce from "lodash/debounce";
import has from "lodash/has";
import isUndefined from "lodash/isUndefined";
import * as React from "react";
import {
  CalculateControls,
  Calculations,
  Charts,
  ErrorBox,
  Info,
  UploadControls,
  VisualizeControls
} from "src/components";
import { IPCACalculations } from "src/models/pca.model";
import { IParsedCSV } from "src/utils/csv";
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
    maxWidth: breakpoints.values.md,
    marginLeft: "auto",
    marginRight: "auto"
  },
  progress: {
    flexGrow: 1
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

export const PrincipalComponentAnalysisPage = (): JSX.Element => {
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
    headers: [],
    data: []
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
      differences: []
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
  const [components, setComponents] = React.useState<{ x: number; y: number }>({
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
    const debounceTime: number = 1000;

    const onUploadWorkerMsg = debounce((event: MessageEvent) => {
      if (has(event.data, "error")) {
        setError(event.data.error);
        setState({ ...state, uploaded: false, uploading: false });
      } else {
        cleanErrors();
        setParsedFile(event.data.parsedFile);
        setState({ ...state, uploaded: true, uploading: false });
      }
    }, debounceTime);

    const onCalculateWorkerMsg = debounce((event: MessageEvent) => {
      setCalculations(event.data);
      setState({ ...state, calculated: true, calculating: false });
    }, debounceTime);

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

  const onChangeSelectComponents = (newComponents: {
    x: number;
    y: number;
  }): void => {
    setComponents({ ...components, ...newComponents });
  };

  return (
    <div className={classes.root}>
      <div className={classes.wrap}>
        <Typography variant="h6" paragraph={true}>
          Principal Component Analysis
        </Typography>
        {(() => {
          if (uploading || calculating) {
            return (
              <div className={classes.progress}>
                <LinearProgress />
              </div>
            );
          }

          if (visualized) {
            return (
              <Charts
                onChangeSelectComponents={onChangeSelectComponents}
                parsedFile={parsedFile}
                calculations={calculations}
                components={components}
              />
            );
          }

          if (calculated) {
            return (
              <>
                <VisualizeControls
                  analysis={analysis}
                  onVisualize={onVisualize}
                  onChangeSelectComponents={onChangeSelectComponents}
                  components={components}
                />
                <Calculations
                  parsedFile={parsedFile}
                  calculations={calculations}
                />
              </>
            );
          }

          if (uploaded) {
            return (
              <CalculateControls
                parsedFile={parsedFile}
                onCalculate={onCalculate}
              />
            );
          }

          return (
            <>
              <Info />
              <UploadControls
                file={file}
                onUpload={onUploadFile}
                onChange={onChangeFile}
                onCancel={onCancelFile}
              />
            </>
          );
        })()}
        <ErrorBox message={error} />
      </div>
    </div>
  );
};
