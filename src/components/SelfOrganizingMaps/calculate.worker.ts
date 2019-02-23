import { generateGrid, Kohonen } from "@seracio/kohonen";
import { IHexagonalGridDimensions } from "src/models/chart.model";
import { IOptions } from "src/models/som.model";

const ctx: Worker = self as any;

interface IEventData {
  data: number[][];
  dimensions: IHexagonalGridDimensions;
  options: IOptions;
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
    neurons: k.neurons
  });
});
