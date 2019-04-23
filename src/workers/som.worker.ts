import { generateGrid, Kohonen } from "@seracio/kohonen";
import unzip from "lodash/unzip";
import {
  IDatasetRequiredColumnsIndexes,
  IParsedFile,
  IHexagonalGridDimensions,
  ISOMOptions,
  Dataset
} from "src/models";

const ctx: Worker = self as any;

interface IEventData {
  datasetRequiredColumnsIdxs: IDatasetRequiredColumnsIndexes;
  parsedFile: IParsedFile;
  dimensions: IHexagonalGridDimensions;
  options: ISOMOptions;
}

ctx.addEventListener(
  "message",
  (event: MessageEvent) => {
    const {
      datasetRequiredColumnsIdxs,
      parsedFile,
      dimensions,
      options
    }: IEventData = event.data;
    const {
      maxStep,
      minLearningCoef,
      maxLearningCoef,
      minNeighborhood,
      maxNeighborhood
    } = options;

    try {
      const dataset = new Dataset(parsedFile, datasetRequiredColumnsIdxs);

      const k = new Kohonen({
        neurons: generateGrid(dimensions.columns, dimensions.rows),
        data: unzip(dataset.values),
        maxStep,
        minLearningCoef,
        maxLearningCoef,
        minNeighborhood,
        maxNeighborhood
      });

      k.training();

      ctx.postMessage({
        dataset,
        positions: k.mapping(),
        umatrix: k.umatrix(),
        neurons: k.neurons,
        topographicError: k.topographicError(),
        quantizationError: k.quantizationError()
      });
    } catch (error) {
      ctx.postMessage({ error: error.message });
    }
  },
  false
);
