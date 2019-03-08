import { generateGrid, Kohonen } from "@seracio/kohonen";
import { IHexagonalGridDimensions, ISOMOptions } from "src/models";

const ctx: Worker = self as any;

interface IEventData {
  data: number[][];
  dimensions: IHexagonalGridDimensions;
  options: ISOMOptions;
}

ctx.addEventListener("message", (event: MessageEvent) => {
  const {
    data,
    dimensions: { columns, rows },
    options: {
      maxStep,
      minLearningCoef,
      maxLearningCoef,
      minNeighborhood,
      maxNeighborhood
    }
  }: IEventData = event.data;

  const k = new Kohonen({
    neurons: generateGrid(columns, rows),
    data,
    maxStep,
    minLearningCoef,
    maxLearningCoef,
    minNeighborhood,
    maxNeighborhood
  });

  k.training();

  ctx.postMessage({
    positions: k.mapping(),
    umatrix: k.umatrix(),
    neurons: k.neurons,
    topographicError: k.topographicError(),
    quantizationError: k.quantizationError()
  });
});
