import LinearProgress from "@material-ui/core/LinearProgress";
import { Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import { Neuron } from "@seracio/kohonen/dist/types";
import debounce from "lodash/debounce";
import isUndefined from "lodash/isUndefined";
import React, { useEffect } from "react";
import { HexagonsMap, SOMControls } from "src/components";
import CalculateWorker from "worker-loader!src/components/SelfOrganizingMaps/calculate.worker";

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

/**
 * self-organizing maps main page
 */
export const SelfOrganizingMaps = (): JSX.Element => {
  const classes = useStyles();

  /**
   * current page state
   */
  const [state, setState] = React.useState<IState>(initialState);
  const { uploading, calculated, calculating } = state;

  /**
   * calculate worker for ...
   */
  const [calculateWorker, createCalculateWorker] = React.useState<
    Worker | undefined
  >(undefined);

  /**
   * collection of neurons
   */
  const [neurons, setNeurons] = React.useState<Neuron[]>([]);

  /**
   * count of hexagons per column
   */
  const [cols, setCols] = React.useState<number>(25);

  /**
   * count of hexagons per row
   */
  const [rows, setRows] = React.useState<number>(12);

  /**
   * hexagon size (step x)
   */
  const [hexagonSize, setHexagonSize] = React.useState<number>(50);

  /**
   * tested dataset
   */
  const data = [
    [0, 0, 0],
    [0, 0, 255],
    [0, 255, 0],
    [0, 255, 255],
    [255, 0, 0],
    [255, 0, 255],
    [255, 255, 0],
    [255, 255, 255]
  ];

  // @ts-ignore: temporary unused function
  const onChangeCols = (count: number) => setCols(count);

  // @ts-ignore: temporary unused function
  const onChangeRows = (count: number) => setRows(count);

  // @ts-ignore: temporary unused function
  const onChangeHexagonSize = (size: number) => setHexagonSize(size);

  useEffect(() => {
    const debounceTime: number = 700;

    const onCalculateWorkerMsg = debounce((event: MessageEvent) => {
      setNeurons(event.data.neurons);
      setState({ ...state, calculated: true, calculating: false });
    }, debounceTime);

    if (isUndefined(calculateWorker)) {
      createCalculateWorker(new CalculateWorker());
    } else {
      setState({ ...state, calculating: true });
      calculateWorker.postMessage({ data, cols, rows });
      calculateWorker.addEventListener("message", onCalculateWorkerMsg, false);
    }

    return () => {
      if (!isUndefined(calculateWorker)) {
        calculateWorker.removeEventListener(
          "message",
          onCalculateWorkerMsg,
          false
        );
        calculateWorker.terminate();
      }
    };
  }, [calculateWorker]);

  return (
    <div className={classes.root}>
      <div className={classes.wrap}>
        <Typography variant="h5" paragraph={true}>
          Self-Organizing Maps
        </Typography>
        {(() => {
          if (uploading || calculating) {
            return (
              <div className={classes.progress}>
                <LinearProgress />
              </div>
            );
          }

          if (calculated) {
            return (
              <>
                <SOMControls />
                <HexagonsMap
                  title="Hexagonal heatmap"
                  neurons={neurons}
                  hexagonSize={hexagonSize}
                />
              </>
            );
          }

          return null;
        })()}
      </div>
    </div>
  );
};
