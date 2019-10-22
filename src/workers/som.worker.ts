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
      const neurons = generateGrid(dimensions.columns, dimensions.rows);
      const data = unzip(dataset.values);

      const k = new Kohonen({
        neurons,
        data,
        maxStep,
        minLearningCoef,
        maxLearningCoef,
        minNeighborhood,
        maxNeighborhood
      });

      ctx.postMessage({
        dataset,
        positions: k.mapping(data),
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
