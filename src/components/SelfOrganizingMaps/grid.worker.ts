import { generateGrid } from "@seracio/kohonen";

const ctx: Worker = self as any;

ctx.addEventListener("message", (event: MessageEvent) => {
  const { dimensions, trainingConfig } = event.data;
  const { columns, rows } = dimensions;

  ctx.postMessage({
    neurons: generateGrid(columns, rows),
    dimensions,
    trainingConfig
  });
});
